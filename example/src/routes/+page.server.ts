import type { PageServerLoad } from './$types';
import { signSession } from '$lib/server/security';

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		formToken: signSession(),
		announcementDismissed: cookies.get('announcement-dismissed') === '1'
	};
};
