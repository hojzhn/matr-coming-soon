import crypto from 'node:crypto';
import { json, type RequestHandler } from '@sveltejs/kit';
import { createArtworkUploadUrl, isValidArtworkMeta } from '$lib/server/artwork';
import { verifySession } from '$lib/server/security';
import { MAX_CART_ITEMS } from '$lib/pricing/config';

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

interface FileMeta {
	index: number;
	fileName: string;
	fileType: string;
	fileSize: number;
}

function isValidFileMeta(value: unknown): value is FileMeta {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		Number.isInteger(v.index) &&
		(v.index as number) >= 0 &&
		(v.index as number) < MAX_CART_ITEMS &&
		typeof v.fileName === 'string' &&
		v.fileName.trim().length > 0 &&
		typeof v.fileType === 'string' &&
		typeof v.fileSize === 'number'
	);
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	const session = verifySession(String(body.formToken ?? ''));
	if (!session.ok) return fail('Unable to process request.');

	const files: unknown[] = Array.isArray(body.files) ? body.files : [];
	if (files.length === 0) return fail('No files to upload.');
	if (files.length > MAX_CART_ITEMS) return fail(`You can order up to ${MAX_CART_ITEMS} prints at a time.`);
	if (!files.every(isValidFileMeta)) return fail('Invalid file metadata.');

	const fileMetas = files as FileMeta[];
	for (const f of fileMetas) {
		if (!isValidArtworkMeta(f.fileType, f.fileSize)) {
			return fail("That file's too big or not a supported type.");
		}
	}

	const orderId = crypto.randomUUID();

	try {
		const uploads = await Promise.all(
			fileMetas.map((f) => createArtworkUploadUrl(orderId, f.index, f.fileName))
		);
		return json({ ok: true, orderId, uploads });
	} catch (err) {
		console.error('createArtworkUploadUrl failed:', err);
		return fail('Could not prepare artwork upload. Please try again.', 500);
	}
};
