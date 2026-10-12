import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin, PRINT_ORDERS_TABLE } from '$lib/server/supabase';
import { isValidOrderId } from '$lib/server/order-id';

export const GET: RequestHandler = async ({ params }) => {
	if (!isValidOrderId(params.id)) {
		return json({ status: null }, { status: 400 });
	}

	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase
		.from(PRINT_ORDERS_TABLE)
		.select('status')
		.eq('id', params.id)
		.single();

	if (error || !data) {
		return json({ status: null }, { status: 404 });
	}

	return json({ status: data.status }, { headers: { 'Cache-Control': 'no-store' } });
};
