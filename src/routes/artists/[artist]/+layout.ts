import { error } from '@sveltejs/kit';
import { studioPlusArtists } from '$lib/content/studio-plus';
import { artistHost } from '$lib/studio-plus-host';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params, url }) => {
	const artist = studioPlusArtists[params.artist];
	if (!artist) error(404, 'Not found');
	const base = artistHost(url.hostname) === artist.username ? '' : `/artists/${artist.username}`;
	return { artist, base };
};
