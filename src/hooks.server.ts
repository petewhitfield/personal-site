import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (response.status === 404 && event.url.pathname !== '/') {
		throw redirect(302, '/');
	}

	return response;
};
