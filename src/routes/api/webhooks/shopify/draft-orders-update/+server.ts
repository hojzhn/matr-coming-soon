import crypto from 'node:crypto';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin, PRINT_ORDERS_TABLE } from '$lib/server/supabase';

interface DraftOrderPayload {
	id: number;
	status: 'open' | 'invoice_sent' | 'completed';
}

function verifyHmac(rawBody: string, header: string | null, secret: string): boolean {
	if (!header) return false;
	const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
	const a = Buffer.from(digest);
	const b = Buffer.from(header);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const POST: RequestHandler = async ({ request }) => {
	const clientSecret = env.SHOPIFY_CLIENT_SECRET;
	if (!clientSecret) {
		console.error('SHOPIFY_CLIENT_SECRET is not set; cannot verify webhook.');
		return new Response(null, { status: 500 });
	}

	const rawBody = await request.text();
	if (!verifyHmac(rawBody, request.headers.get('x-shopify-hmac-sha256'), clientSecret)) {
		return new Response('Invalid signature.', { status: 401 });
	}

	const shopHeader = request.headers.get('x-shopify-shop-domain');
	if (env.SHOPIFY_STORE_DOMAIN && shopHeader !== env.SHOPIFY_STORE_DOMAIN) {
		return new Response('Unexpected shop.', { status: 401 });
	}

	const payload = JSON.parse(rawBody) as DraftOrderPayload;
	if (payload.status !== 'completed') {
		return new Response(null, { status: 200 });
	}

	const draftGid = `gid://shopify/DraftOrder/${payload.id}`;

	const supabase = getSupabaseAdmin();
	const { data: order, error } = await supabase
		.from(PRINT_ORDERS_TABLE)
		.select('id, status')
		.eq('shopify_draft_order_id', draftGid)
		.single();

	if (error || !order) {
		console.error('No matching order for paid draft order:', draftGid, error);
		return new Response(null, { status: 200 });
	}

	if (order.status === 'paid') {
		return new Response(null, { status: 200 });
	}

	await supabase.from(PRINT_ORDERS_TABLE).update({ status: 'paid' }).eq('id', order.id);

	return new Response(null, { status: 200 });
};
