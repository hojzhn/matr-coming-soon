import { json, type RequestHandler } from '@sveltejs/kit';
import { verifySession, MIN_SUBMIT_MS } from '$lib/server/security';
import { sendContactNotification } from '$lib/server/email';

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

	const name = String(body.name ?? '').trim();
	const email = String(body.email ?? '').trim();
	const message = String(body.message ?? '').trim();

	if (!name) return fail('Please provide your name.');
	if (!EMAIL_RE.test(email)) return fail('Please provide a valid email.');
	if (!message) return fail('Please provide a message.');

	const result = await sendContactNotification({ name, email, message });
	if (!result.ok) return fail(result.error || 'Could not send your message. Please try again.', 500);

	return json({ ok: true });
};
