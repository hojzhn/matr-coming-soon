import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin, NEWSLETTER_TABLE } from '$lib/server/supabase';
import { verifySession, MIN_SUBMIT_MS } from '$lib/server/security';
import { sendNewsletterNotification } from '$lib/server/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

function decoy() {
	return json({ ok: true });
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	if (String(body.company ?? '').trim() !== '') return decoy();

	const session = verifySession(String(body.formToken ?? ''));
	if (!session.ok || session.ageMs < MIN_SUBMIT_MS) return decoy();

	const email = String(body.email ?? '').trim();
	if (!EMAIL_RE.test(email)) return fail('Please provide a valid email.');

	let supabase;
	try {
		supabase = getSupabaseAdmin();
	} catch (err) {
		console.error(err);
		return fail('Server is not configured yet.', 500);
	}

	const { error } = await supabase.from(NEWSLETTER_TABLE).insert({ email });
	if (error && error.code !== '23505') {
		console.error('Newsletter insert failed:', error);
		return fail('Could not save your email. Please try again.', 500);
	}

	sendNewsletterNotification({ email }).catch((err) =>
		console.error('Newsletter notification failed:', err)
	);

	return json({ ok: true });
};
