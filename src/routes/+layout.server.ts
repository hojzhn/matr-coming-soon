import type { LayoutServerLoad } from './$types';
import { signSession } from '$lib/server/security';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return {
		formToken: signSession(),
		announcementDismissed: cookies.get('announcement-dismissed') === '1',
		cookieNoticeDismissed: cookies.get('cookie-notice-dismissed') === '1'
	};
};
