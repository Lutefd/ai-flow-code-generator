import type { PageServerLoad } from './$types';

export const load = (async () => {
	console.log('Page server load');
	return {};
}) satisfies PageServerLoad;
