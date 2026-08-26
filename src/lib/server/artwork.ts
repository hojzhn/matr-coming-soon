import { getSupabaseAdmin, ORDER_ARTWORK_BUCKET } from './supabase';
import { MAX_ARTWORK_FILE_BYTES, ACCEPTED_ARTWORK_TYPES } from '$lib/pricing/config';

export interface ArtworkUploadTarget {
	index: number;
	path: string;
	signedUrl: string;
}

function sanitizeExt(fileName: string): string {
	return fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

export function artworkPath(orderId: string, index: number, fileName: string): string {
	return `${orderId}/${index}.${sanitizeExt(fileName)}`;
}

export function isValidArtworkMeta(fileType: string, fileSize: number): boolean {
	return (
		ACCEPTED_ARTWORK_TYPES.includes(fileType) &&
		Number.isFinite(fileSize) &&
		fileSize > 0 &&
		fileSize <= MAX_ARTWORK_FILE_BYTES
	);
}

export async function createArtworkUploadUrl(
	orderId: string,
	index: number,
	fileName: string
): Promise<ArtworkUploadTarget> {
	const supabase = getSupabaseAdmin();
	const path = artworkPath(orderId, index, fileName);
	const { data, error } = await supabase.storage.from(ORDER_ARTWORK_BUCKET).createSignedUploadUrl(path);
	if (error || !data) throw new Error('Could not prepare artwork upload.');
	return { index, path, signedUrl: data.signedUrl };
}

const ARTWORK_READ_URL_EXPIRY_SECONDS = 60 * 5; // generated fresh per click via the redirect route, so a short lease is enough

export async function createArtworkReadUrl(path: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase.storage
		.from(ORDER_ARTWORK_BUCKET)
		.createSignedUrl(path, ARTWORK_READ_URL_EXPIRY_SECONDS);
	if (error || !data) {
		console.error('createArtworkReadUrl failed:', error);
		return null;
	}
	return data.signedUrl;
}

export async function listUploadedArtworkNames(orderId: string): Promise<Set<string>> {
	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase.storage.from(ORDER_ARTWORK_BUCKET).list(orderId);
	if (error) throw new Error('Could not verify uploaded artwork.');
	return new Set((data ?? []).map((f) => f.name));
}
