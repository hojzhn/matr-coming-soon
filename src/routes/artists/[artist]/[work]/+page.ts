import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { artist } = await parent();
	for (const collection of artist.collections) {
		const index = collection.works.findIndex((work) => work.slug === params.work);
		if (index < 0) continue;
		const count = collection.works.length;
		return {
			collection,
			work: collection.works[index],
			prev: collection.works[(index - 1 + count) % count],
			next: collection.works[(index + 1) % count]
		};
	}
	error(404, 'Not found');
};
