import crypto from 'node:crypto';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function verifyHmac(params: URLSearchParams, secret: string): boolean {
	const hmac = params.get('hmac');
	if (!hmac) return false;

	const pairs: string[] = [];
	for (const [key, value] of params) {
		if (key === 'hmac' || key === 'signature') continue;
		pairs.push(`${key}=${value}`);
	}
	pairs.sort();
	const digest = crypto.createHmac('sha256', secret).update(pairs.join('&')).digest('hex');

	const a = Buffer.from(digest);
	const b = Buffer.from(hmac);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const shop = env.SHOPIFY_STORE_DOMAIN;
	const clientId = env.SHOPIFY_CLIENT_ID;
	const clientSecret = env.SHOPIFY_CLIENT_SECRET;
	if (!shop || !clientId || !clientSecret) {
		return new Response('Set SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET in .env first.', {
			status: 500
		});
	}

	const state = url.searchParams.get('state');
	const savedState = cookies.get('shopify_oauth_state');
	cookies.delete('shopify_oauth_state', { path: '/api/shopify' });

	if (!state || state !== savedState) {
		return new Response('Invalid or expired state. Start over at /api/shopify/install.', { status: 400 });
	}
	if (!verifyHmac(url.searchParams, clientSecret)) {
		return new Response('Invalid HMAC signature.', { status: 400 });
	}
	if (url.searchParams.get('shop') !== shop) {
		return new Response(`Unexpected shop: ${url.searchParams.get('shop')}`, { status: 400 });
	}

	const code = url.searchParams.get('code');
	if (!code) return new Response('Missing code.', { status: 400 });

	const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
	});

	if (!res.ok) {
		return new Response(`Token exchange failed: ${res.status} ${await res.text()}`, { status: 500 });
	}

	const data = (await res.json()) as { access_token?: string; scope?: string };
	if (!data.access_token) {
		return new Response('No access_token in response.', { status: 500 });
	}

	console.log(`SHOPIFY_ADMIN_API_ACCESS_TOKEN=${data.access_token}`);

	return new Response(
		`<pre>Installed. Granted scope: ${data.scope}

Copy this into .env as SHOPIFY_ADMIN_API_ACCESS_TOKEN:

${data.access_token}

Then delete src/routes/api/shopify/ and remove SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET from .env — this bootstrap flow is single-use.</pre>`,
		{ headers: { 'Content-Type': 'text/html' } }
	);
};
