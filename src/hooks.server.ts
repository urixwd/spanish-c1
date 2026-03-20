import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	console.error(`[${event.request.method} ${event.url.pathname}] ${status}: ${message}`);
	console.error(error);

	return {
		message
	};
};
