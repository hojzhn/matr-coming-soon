import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin, CONTACT_MESSAGES_TABLE, SHOPS_TABLE } from '$lib/server/supabase';
import { verifySession, MIN_SUBMIT_MS } from '$lib/server/security';
import { sendContactNotification } from '$lib/server/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

function decoy() {
	return json({ ok: true });
}

async function saveContactMessage(args: { name: string; email: string; message: string }): Promise<string | null> {
	try {
		const supabase = getSupabaseAdmin();

		const { data: shop } = await supabase
			.from(SHOPS_TABLE)
			.select('id')
			.eq('shopify_domain', env.SHOPIFY_STORE_DOMAIN)
			.maybeSingle();

		const { data, error } = await supabase
			.from(CONTACT_MESSAGES_TABLE)
			.insert({ ...args, shop_id: shop?.id ?? null })
			.select('id')
			.single();
		if (error) throw error;
		return data.id;
	} catch (err) {
		console.error('Contact message insert failed:', err);
		return null;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	if (String(body.company ?? '').trim() !== '') return decoy();

	const session = verifySession(String(body.formToken ?? ''));
	if (!session.ok || session.ageMs < MIN_SUBMIT_MS) return decoy();

	const name = String(body.name ?? '').trim();
	const email = String(body.email ?? '').trim();
	const message = String(body.message ?? '').trim();

	if (!name) return fail('Please provide your name.');
	if (!EMAIL_RE.test(email)) return fail('Please provide a valid email.');
	if (!message) return fail('Please provide a message.');

	const messageId = await saveContactMessage({ name, email, message });

	const result = await sendContactNotification({ name, email, message });

	if (result.ok && messageId) {
		const { error } = await getSupabaseAdmin()
			.from(CONTACT_MESSAGES_TABLE)
			.update({ email_notified_at: new Date().toISOString() })
			.eq('id', messageId);
		if (error) console.error('Contact message notify update failed:', error);
	}

	if (!result.ok && !messageId) {
		return fail(result.error || 'Could not send your message. Please try again.', 500);
	}

	return json({ ok: true });
};
