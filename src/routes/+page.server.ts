import { getWritings } from '$lib/server/writings';

export async function load() {
	const writings = await getWritings();
	const entries = writings.map(({ slug, title, section }) => ({
		slug,
		title,
		section
	}));

	return {
		culture: entries.filter((writing) => writing.section === 'culture'),
		engineering: entries.filter((writing) => writing.section === 'engineering'),
		architecture: entries.filter((writing) => writing.section === 'architecture')
	};
}
