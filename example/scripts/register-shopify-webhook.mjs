// Idempotently ensures the draft_orders/update webhook subscription exists on the
// Shopify app that SHOPIFY_ADMIN_API_ACCESS_TOKEN belongs to.
//
// This app was set up via a one-time OAuth bootstrap (src/routes/api/shopify/install
// -> callback) and is NOT the app declared in shopify.app.toml or
// shopify.app.matr-front.toml (those are unrelated, stale dev-only app registrations
// with different client_ids, still pointed at localhost). This app has no Shopify-CLI
// config and is managed purely through the Admin API, so `shopify app deploy` does not
// apply here — re-run this script any time you need to confirm or restore the webhook.
//
// Usage: node scripts/register-shopify-webhook.mjs

import { readFileSync, existsSync } from 'node:fs';

const TOPIC = 'DRAFT_ORDERS_UPDATE';
const CALLBACK_PATH = '/api/webhooks/shopify/draft-orders-update';

function loadEnv() {
	if (!existsSync('.env')) return {};
	const text = readFileSync('.env', 'utf8');
	const env = {};
	for (const line of text.split(/\r?\n/)) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m) env[m[1]] = m[2];
	}
	return env;
}

async function shopifyGraphql(domain, version, token, query, variables) {
	const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
		body: JSON.stringify({ query, variables })
	});
	const json = await res.json();
	if (json.errors?.length) {
		throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
	}
	return json.data;
}

async function main() {
	const env = { ...loadEnv(), ...process.env };

	const domain = env.SHOPIFY_STORE_DOMAIN;
	const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
	const version = env.SHOPIFY_API_VERSION || '2025-01';
	const siteOrigin = env.SITE_ORIGIN || 'https://www.matr.art';

	if (!domain || !token) {
		console.error('Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_ACCESS_TOKEN in .env first.');
		process.exitCode = 1;
		return;
	}

	const callbackUrl = `${siteOrigin}${CALLBACK_PATH}`;

	const existing = await shopifyGraphql(
		domain,
		version,
		token,
		`{ webhookSubscriptions(first: 50, topics: [${TOPIC}]) { nodes { id topic callbackUrl } } }`
	);

	const alreadyRegistered = existing.webhookSubscriptions.nodes.find((n) => n.callbackUrl === callbackUrl);
	if (alreadyRegistered) {
		console.log(`Already registered: ${alreadyRegistered.id} -> ${alreadyRegistered.callbackUrl}`);
		return;
	}

	const result = await shopifyGraphql(
		domain,
		version,
		token,
		`mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
			webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
				webhookSubscription { id topic callbackUrl format }
				userErrors { field message }
			}
		}`,
		{ topic: TOPIC, webhookSubscription: { callbackUrl, format: 'JSON' } }
	);

	const { webhookSubscription, userErrors } = result.webhookSubscriptionCreate;
	if (userErrors.length) {
		console.error('Failed to register webhook:', userErrors);
		process.exitCode = 1;
		return;
	}

	console.log(`Registered: ${webhookSubscription.id} -> ${webhookSubscription.callbackUrl}`);
}

await main();
