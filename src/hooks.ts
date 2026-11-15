import type { Reroute } from '@sveltejs/kit';
import { artistHost } from '$lib/studio-plus-host';

const siteRoutes = new Set(['api', 'artists', 'contact', 'oil-edition', 'studio', 'studio-plus']);

export const reroute: Reroute = ({ url }) => {
	const username = artistHost(url.hostname);
	if (!username) return;
	const first = url.pathname.split('/')[1];
	if (siteRoutes.has(first)) return;
	return `/artists/${username}${url.pathname === '/' ? '' : url.pathname}`;
};
