import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const raw = cookies.get('cookie-consent');
	const cookieConsent = raw === 'accepted' || raw === 'rejected' ? raw : null;
	return { cookieConsent };
};
