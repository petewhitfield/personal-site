import { getWritings } from '$lib/server/writings';

export async function load() {
	const writings = await getWritings();
	const entries = writings.map(({ slug, title }) => ({
		slug,
		title
	}));

	return {
		writings: entries
	};
}
