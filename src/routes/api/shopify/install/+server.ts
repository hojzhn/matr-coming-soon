import crypto from 'node:crypto';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const SCOPES = 'write_draft_orders,read_draft_orders,read_discounts';

export const GET: RequestHandler = ({ cookies, url }) => {
	const shop = env.SHOPIFY_STORE_DOMAIN;
	const clientId = env.SHOPIFY_CLIENT_ID;
	if (!shop || !clientId) {
		return new Response('Set SHOPIFY_STORE_DOMAIN and SHOPIFY_CLIENT_ID in .env first.', { status: 500 });
	}

	const state = crypto.randomBytes(16).toString('hex');
	cookies.set('shopify_oauth_state', state, {
		path: '/api/shopify',
		httpOnly: true,
		maxAge: 600,
		sameSite: 'lax'
	});

	const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
	authorizeUrl.searchParams.set('client_id', clientId);
	authorizeUrl.searchParams.set('scope', SCOPES);
	authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/api/shopify/callback`);
	authorizeUrl.searchParams.set('state', state);

	redirect(302, authorizeUrl.toString());
};
