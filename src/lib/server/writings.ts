import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHighlighter, createCssVariablesTheme, type Highlighter } from 'shiki';
import stage1Image from '$lib/assets/stage_1.png';
import stage2Image from '$lib/assets/stage_2.png';
import stage3Image from '$lib/assets/stage_3.png';
import stage4Image from '$lib/assets/stage_4.png';

type WritingMetadata = {
	title: string;
	date: string;
	with?: string;
	description?: string;
	section?: string;
	order?: number;
};

export type TocItem = {
	id: string;
	level: number;
	text: string;
};

export type Writing = WritingMetadata & {
	slug: string;
	withHtml?: string;
	body: string;
	html: string;
	toc: TocItem[];
};

const contentDirectory = path.resolve('src/lib/content/writings');
const imageAssetUrls: Record<string, string> = {
	'stage_1.png': stage1Image,
	'stage_2.png': stage2Image,
	'stage_3.png': stage3Image,
	'stage_4.png': stage4Image
};

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

function resolveImageUrl(url: string) {
	const trimmed = url.trim();
	return imageAssetUrls[trimmed] ?? trimmed;
}

function getDateSortValue(value: string) {
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getOrderSortValue(value?: number) {
	return value ?? Number.MAX_SAFE_INTEGER;
}

const cssVarTheme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--shiki-' });

let highlighterInstance: Highlighter | null = null;

async function getHighlighter() {
	if (!highlighterInstance) {
		highlighterInstance = await createHighlighter({
			themes: [cssVarTheme],
			langs: ['typescript', 'graphql', 'json']
		});
	}
	return highlighterInstance;
}

function resolveShikiLang(language: string): string | null {
	const normalized = language.trim().toLowerCase();
	if (['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(normalized))
		return 'typescript';
	if (normalized === 'graphql' || normalized === 'gql') return 'graphql';
	if (normalized === 'json') return 'json';
	return null;
}

async function highlightCode(code: string, language: string): Promise<string> {
	const lang = resolveShikiLang(language);
	if (!lang) return escapeHtml(code);

	const highlighter = await getHighlighter();
	const html = highlighter.codeToHtml(code, { lang, theme: 'css-variables' });

	const innerMatch = html.match(/<pre[^>]*><code[^>]*>([\s\S]*)<\/code><\/pre>/);
	return innerMatch ? innerMatch[1] : escapeHtml(code);
}

function applyInlineMarkdown(text: string) {
	const escaped = escapeHtml(text);

	return escaped
		.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, url: string) => {
			const resolvedUrl = resolveImageUrl(url);
			return `<img src="${sanitizeUrl(resolvedUrl)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />`;
		})
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => {
			const href = sanitizeUrl(url);
			const external = href.startsWith('http');
			const attrs = external ? ' rel="noreferrer" target="_blank"' : '';
			return `<a href="${href}"${attrs}>${label}</a>`;
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

		const key = line.slice(0, separatorIndex).trim().toLowerCase();
		const value = line.slice(separatorIndex + 1).trim();
		acc[key] = value;
		return acc;
	}, {});

	if (!metadata.title || !metadata.date) {
		throw new Error('Markdown frontmatter must include title and date.');
	}

	return {
		metadata: {
			title: metadata.title,
			date: metadata.date,
			with: metadata.with || undefined,
			description: metadata.description || undefined,
			section: metadata.section || undefined,
			order:
				metadata.order && !Number.isNaN(Number(metadata.order)) ? Number(metadata.order) : undefined
		},
		body
	};
}

async function renderMarkdown(markdown: string) {
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

	async function flushCodeBlock() {
		if (!inCodeBlock) return;
		const className = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : '';
		const code = codeLines.join('\n');
		html.push(`<pre><code${className}>${await highlightCode(code, codeLanguage)}</code></pre>`);
		codeLines = [];
		codeLanguage = '';
		inCodeBlock = false;
	}

	for (const line of lines) {
		if (line.startsWith('```')) {
			if (inCodeBlock) {
				await flushCodeBlock();
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

			if (level === 2) {
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
	await flushCodeBlock();

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
	const { html, toc } = await renderMarkdown(body);

	return {
		slug,
		...metadata,
		withHtml: metadata.with ? applyInlineMarkdown(metadata.with) : undefined,
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
