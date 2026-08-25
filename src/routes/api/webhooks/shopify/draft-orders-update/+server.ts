import crypto from 'node:crypto';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin, PRINT_ORDERS_TABLE, ORDER_ITEMS_TABLE } from '$lib/server/supabase';
import { sendOrderNotification, type OrderNotificationLineItem } from '$lib/server/email';

interface DraftOrderPayload {
	id: number;
	status: 'open' | 'invoice_sent' | 'completed';
}

interface StoredOrderItem {
	project_name: string | null;
	width_in: number;
	height_in: number;
	base_price_cents: number;
	options: { id: string; label: string; priceDeltaCents: number }[];
	margin_in: number | null;
	quantity: number;
	unit_price_cents: number;
	total_price_cents: number;
	artwork_path: string | null;
	artwork_file_name: string | null;
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
		.select('id, total_price_cents, shopify_invoice_url, status')
		.eq('shopify_draft_order_id', draftGid)
		.single();

	if (error || !order) {
		console.error('No matching order for paid draft order:', draftGid, error);
		return new Response(null, { status: 200 });
	}

	if (order.status === 'paid') {
		return new Response(null, { status: 200 });
	}

	const { data: items, error: itemsError } = await supabase
		.from(ORDER_ITEMS_TABLE)
		.select(
			'project_name, width_in, height_in, base_price_cents, options, margin_in, quantity, unit_price_cents, total_price_cents, artwork_path, artwork_file_name'
		)
		.eq('order_id', order.id);

	if (itemsError) {
		console.error('Could not load order items for notification:', draftGid, itemsError);
	}

	const lineItems: OrderNotificationLineItem[] = ((items ?? []) as StoredOrderItem[]).map((item) => ({
		projectName: item.project_name ?? undefined,
		widthIn: item.width_in,
		heightIn: item.height_in,
		basePriceCents: item.base_price_cents,
		options: item.options,
		marginIn: item.margin_in ?? undefined,
		quantity: item.quantity,
		unitPriceCents: item.unit_price_cents,
		totalPriceCents: item.total_price_cents,
		artworkPath: item.artwork_path,
		artworkFileName: item.artwork_file_name
	}));

	await sendOrderNotification({
		items: lineItems,
		totalPriceCents: order.total_price_cents,
		invoiceUrl: order.shopify_invoice_url ?? ''
	}).catch((err) => console.error('Order notification failed:', err));

	await supabase.from(PRINT_ORDERS_TABLE).update({ status: 'paid' }).eq('id', order.id);

	return new Response(null, { status: 200 });
};
