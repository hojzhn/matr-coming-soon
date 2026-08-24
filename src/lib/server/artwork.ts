import { getSupabaseAdmin, ORDER_ARTWORK_BUCKET } from './supabase';
import { MAX_ARTWORK_FILE_BYTES, ACCEPTED_ARTWORK_TYPES } from '$lib/pricing/config';

export interface UploadedArtwork {
	path: string;
	fileName: string;
}

export async function uploadOrderArtwork(orderId: string, index: number, file: File): Promise<UploadedArtwork> {
	if (!ACCEPTED_ARTWORK_TYPES.includes(file.type)) {
		throw new Error('Unsupported artwork file type.');
	}
	if (file.size > MAX_ARTWORK_FILE_BYTES) {
		throw new Error('Artwork file is too large.');
	}

	const supabase = getSupabaseAdmin();
	const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
	const path = `${orderId}/${index}.${ext}`;

	const { error } = await supabase.storage
		.from(ORDER_ARTWORK_BUCKET)
		.upload(path, file, { contentType: file.type, upsert: false });

	if (error) throw new Error(`Artwork upload failed: ${error.message}`);

	return { path, fileName: file.name };
}
