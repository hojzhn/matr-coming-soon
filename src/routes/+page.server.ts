import type { PageServerLoad } from './$types';
import { signSession } from '$lib/server/security';

export const load: PageServerLoad = async () => {
	return { formToken: signSession() };
};
