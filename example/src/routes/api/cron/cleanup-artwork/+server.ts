import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { removeArtwork } from '$lib/server/artwork';

export const GET: RequestHandler = async ({ request }) => {
	if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase.rpc('stale_order_artwork_paths');
	if (error) {
		console.error('stale_order_artwork_paths failed:', error);
		return json({ ok: false }, { status: 500 });
	}

	const paths = (data ?? []).map((row: { path: string }) => row.path);
	try {
		await removeArtwork(paths);
	} catch (err) {
		console.error(err);
		return json({ ok: false }, { status: 500 });
	}

	return json({ ok: true, removed: paths.length });
};
