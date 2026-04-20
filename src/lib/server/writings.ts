import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

type WritingMetadata = {
	title: string;
	date: string;
	description: string;
	section: 'culture' | 'engineering' | 'architecture';
	order?: number;
};

type WritingSection = WritingMetadata['section'];

export type TocItem = {
	id: string;
	level: number;
	text: string;
};

export type Writing = WritingMetadata & {
	slug: string;
	body: string;
	html: string;
	toc: TocItem[];
};

const contentDirectory = path.resolve('src/lib/content/writings');

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function sanitizeUrl(url: string) {
	const trimmed = url.trim();
	return /^(https?:|mailto:|#|\/)/.test(trimmed) ? escapeHtml(trimmed) : '#';
}

function getDateSortValue(value: string) {
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getOrderSortValue(value?: number) {
	return value ?? 0;
}

function renderToken(value: string, className?: string) {
	const escaped = escapeHtml(value);
	return className ? `<span class="${className}">${escaped}</span>` : escaped;
}

function normalizeCodeLanguage(language: string) {
	const normalized = language.trim().toLowerCase();

	if (['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(normalized)) return 'script';
	if (normalized === 'graphql' || normalized === 'gql') return 'graphql';
	if (normalized === 'json') return 'json';

	return '';
}

function highlightCode(code: string, language: string) {
	const normalizedLanguage = normalizeCodeLanguage(language);

	if (!normalizedLanguage) {
		return escapeHtml(code);
	}

	const patterns: Record<string, RegExp> = {
		script:
			/("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\/\/.*$|\/\*[\s\S]*?\*\/|\b(?:const|let|var|function|return|if|else|for|while|await|async|import|from|export|default|new|try|catch|throw|class|extends)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/=<>!&|]+)/gm,
		graphql:
			/("([^"\\]|\\.)*"|#[^\n]*|\b(?:query|mutation|subscription|fragment|on)\b|\b(?:true|false|null)\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:!$=|@]+)/gm,
		json: /("([^"\\]|\\.)*"|\b(?:true|false|null)\b|\b-?\d+(?:\.\d+)?\b|[{}[\],:])/gm
	};

	const pattern = patterns[normalizedLanguage];
	let highlighted = '';
	let lastIndex = 0;

	for (const match of code.matchAll(pattern)) {
		const token = match[0];
		const index = match.index ?? 0;

		highlighted += renderToken(code.slice(lastIndex, index));

		let className = 'token-punctuation';

		if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('#')) {
			className = 'token-comment';
		} else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
			className =
				normalizedLanguage === 'json' && token.endsWith(':') ? 'token-property' : 'token-string';
		} else if (
			/^(query|mutation|subscription|fragment|on|const|let|var|function|return|if|else|for|while|await|async|import|from|export|default|new|try|catch|throw|class|extends|true|false|null|undefined)$/.test(
				token
			)
		) {
			className = /^(true|false|null|undefined)$/.test(token) ? 'token-keyword' : 'token-keyword';
		} else if (/^-?\d+(?:\.\d+)?$/.test(token)) {
			className = 'token-number';
		} else if (normalizedLanguage === 'json' && /^"([^"\\]|\\.)*"$/.test(token)) {
			className = 'token-property';
		}

		highlighted += renderToken(token, className);
		lastIndex = index + token.length;
	}

	highlighted += renderToken(code.slice(lastIndex));

	return highlighted;
}

function applyInlineMarkdown(text: string) {
	const escaped = escapeHtml(text);

	return escaped
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => {
			return `<a href="${sanitizeUrl(url)}">${label}</a>`;
		})
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function parseFrontmatter(fileContents: string) {
	if (!fileContents.startsWith('---\n')) {
		throw new Error('Markdown files must start with frontmatter.');
	}

	const endIndex = fileContents.indexOf('\n---\n', 4);

	if (endIndex === -1) {
		throw new Error('Markdown frontmatter is missing a closing delimiter.');
	}

	const rawFrontmatter = fileContents.slice(4, endIndex);
	const body = fileContents.slice(endIndex + 5).trim();
	const metadata = rawFrontmatter.split('\n').reduce<Record<string, string>>((acc, line) => {
		const separatorIndex = line.indexOf(':');

		if (separatorIndex === -1) {
			return acc;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();
		acc[key] = value;
		return acc;
	}, {});

	if (!metadata.title || !metadata.date || !metadata.description) {
		throw new Error('Markdown frontmatter must include title, date, and description.');
	}

	const section: WritingSection =
		metadata.section === 'architecture'
			? 'architecture'
			: metadata.section === 'culture'
				? 'culture'
				: 'engineering';

	return {
		metadata: {
			title: metadata.title,
			date: metadata.date,
			description: metadata.description,
			section,
			order:
				metadata.order && !Number.isNaN(Number(metadata.order)) ? Number(metadata.order) : undefined
		},
		body
	};
}

function renderMarkdown(markdown: string) {
	const lines = markdown.split('\n');
	const toc: TocItem[] = [];
	const html: string[] = [];

	let paragraphLines: string[] = [];
	let listItems: string[] = [];
	let blockquoteLines: string[] = [];
	let codeLines: string[] = [];
	let codeLanguage = '';
	let inCodeBlock = false;

	function flushParagraph() {
		if (paragraphLines.length === 0) return;
		html.push(`<p>${applyInlineMarkdown(paragraphLines.join(' '))}</p>`);
		paragraphLines = [];
	}

	function flushList() {
		if (listItems.length === 0) return;
		html.push(
			`<ul>${listItems.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join('')}</ul>`
		);
		listItems = [];
	}

	function flushBlockquote() {
		if (blockquoteLines.length === 0) return;
		html.push(`<blockquote><p>${applyInlineMarkdown(blockquoteLines.join(' '))}</p></blockquote>`);
		blockquoteLines = [];
	}

	function flushCodeBlock() {
		if (!inCodeBlock) return;
		const className = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : '';
		const code = codeLines.join('\n');
		html.push(`<pre><code${className}>${highlightCode(code, codeLanguage)}</code></pre>`);
		codeLines = [];
		codeLanguage = '';
		inCodeBlock = false;
	}

	for (const line of lines) {
		if (line.startsWith('```')) {
			if (inCodeBlock) {
				flushCodeBlock();
			} else {
				flushParagraph();
				flushList();
				flushBlockquote();
				inCodeBlock = true;
				codeLanguage = line.slice(3).trim();
			}
			continue;
		}

		if (inCodeBlock) {
			codeLines.push(line);
			continue;
		}

		const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
		if (headingMatch) {
			flushParagraph();
			flushList();
			flushBlockquote();

			const level = headingMatch[1].length;
			const text = headingMatch[2].trim();
			const id = slugify(text);

			if (level >= 2) {
				toc.push({ id, level, text });
			}

			html.push(`<h${level} id="${id}">${applyInlineMarkdown(text)}</h${level}>`);
			continue;
		}

		const listMatch = line.match(/^-\s+(.*)$/);
		if (listMatch) {
			flushParagraph();
			flushBlockquote();
			listItems.push(listMatch[1].trim());
			continue;
		}

		const blockquoteMatch = line.match(/^>\s?(.*)$/);
		if (blockquoteMatch) {
			flushParagraph();
			flushList();
			blockquoteLines.push(blockquoteMatch[1].trim());
			continue;
		}

		if (line.trim() === '') {
			flushParagraph();
			flushList();
			flushBlockquote();
			continue;
		}

		paragraphLines.push(line.trim());
	}

	flushParagraph();
	flushList();
	flushBlockquote();
	flushCodeBlock();

	return {
		html: html.join('\n'),
		toc
	};
}

async function loadWritingFromFile(fileName: string): Promise<Writing> {
	const slug = fileName.replace(/\.md$/, '');
	const filePath = path.join(contentDirectory, fileName);
	const fileContents = await readFile(filePath, 'utf-8');
	const { metadata, body } = parseFrontmatter(fileContents);
	const { html, toc } = renderMarkdown(body);

	return {
		slug,
		...metadata,
		body,
		html,
		toc
	};
}

export async function getWritings() {
	const entries = await readdir(contentDirectory);
	const markdownFiles = entries.filter((entry) => entry.endsWith('.md')).sort();
	const writings = await Promise.all(markdownFiles.map(loadWritingFromFile));

	return writings.sort((a, b) => {
		const orderDifference = getOrderSortValue(b.order) - getOrderSortValue(a.order);

		if (orderDifference !== 0) {
			return orderDifference;
		}

		return getDateSortValue(b.date) - getDateSortValue(a.date);
	});
}

export async function getWritingBySlug(slug: string) {
	const writings = await getWritings();
	return writings.find((writing) => writing.slug === slug) ?? null;
}
