import { json, type RequestHandler } from '@sveltejs/kit';
import { verifySession } from '$lib/server/security';
import { lookupDiscountCode } from '$lib/server/shopify';
import { computeDiscountCents } from '$lib/pricing/discount';

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	const session = verifySession(String(body.formToken ?? ''));
	if (!session.ok) return fail('Unable to process request.');

	const code = String(body.code ?? '').trim();
	const subtotalCents = Number(body.subtotalCents);
	if (!code) return fail('Enter a discount code.');
	if (!Number.isFinite(subtotalCents) || subtotalCents <= 0) {
		return fail('Add a print to your cart first.');
	}

	try {
		const discount = await lookupDiscountCode(code);
		const discountCents = computeDiscountCents(subtotalCents, discount);
		return json({ ok: true, code, title: discount.title, discountCents });
	} catch (err) {
		return fail(err instanceof Error ? err.message : "That discount code isn't valid.");
	}
};
