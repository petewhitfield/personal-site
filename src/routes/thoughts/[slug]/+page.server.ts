import { error } from '@sveltejs/kit';
import { getWritingBySlug } from '$lib/server/writings';

export async function load({ params }) {
	const writing = await getWritingBySlug(params.slug);

	if (!writing) {
		throw error(404, 'Writing not found');
	}

	return { writing };
}
