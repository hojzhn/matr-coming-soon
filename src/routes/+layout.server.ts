import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const cookieNoticeDismissed = cookies.get('cookie-notice-dismissed') === '1';
	return { cookieNoticeDismissed };
};
