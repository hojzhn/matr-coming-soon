import type { PageServerLoad } from './$types';
import { signSession } from '$lib/server/security';
import { toolboxContent, siteContent } from '$lib/content';

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		title: `${toolboxContent.title} | ${siteContent.name}`,
		formToken: signSession(),
		announcementDismissed: cookies.get('announcement-dismissed') === '1'
	};
};
