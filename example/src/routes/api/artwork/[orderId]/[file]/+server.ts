import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { isValidOrderId } from '$lib/server/order-id';
import { createArtworkReadUrl } from '$lib/server/artwork';

const FILE_RE = /^\d+\.[a-z0-9]+$/i;

export const GET: RequestHandler = async ({ params }) => {
	if (!isValidOrderId(params.orderId) || !FILE_RE.test(params.file ?? '')) {
		error(404, 'Not found');
	}

	const signedUrl = await createArtworkReadUrl(`${params.orderId}/${params.file}`);
	if (!signedUrl) {
		error(404, 'Not found');
	}

	redirect(302, signedUrl);
};
