import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
	if (client) return client;

	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error('Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
	}

	client = createClient(url, key, { auth: { persistSession: false } });
	return client;
}

export const PRINT_ORDERS_TABLE = 'print_orders';
export const NEWSLETTER_TABLE = 'newsletter_subscribers';
export const ORDER_ARTWORK_BUCKET = 'order-artwork';
