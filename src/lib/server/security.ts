import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

function signingKey(): string {
	return env.TURNSTILE_SECRET_KEY || 'insecure-dev-key';
}

export function signSession(now = Date.now()): string {
	const ts = String(now);
	const sig = crypto.createHmac('sha256', signingKey()).update(ts).digest('base64url');
	return `${Buffer.from(ts).toString('base64url')}.${sig}`;
}

export function verifySession(token: string): { ok: boolean; ageMs: number } {
	if (!token || !token.includes('.')) return { ok: false, ageMs: 0 };
	const [b64, sig] = token.split('.');
	let ts: string;
	try {
		ts = Buffer.from(b64, 'base64url').toString();
	} catch {
		return { ok: false, ageMs: 0 };
	}
	const expected = crypto.createHmac('sha256', signingKey()).update(ts).digest('base64url');
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, ageMs: 0 };
	const issued = Number(ts);
	if (!Number.isFinite(issued)) return { ok: false, ageMs: 0 };
	return { ok: true, ageMs: Date.now() - issued };
}

export const MIN_SUBMIT_MS = 2000;

export async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
	const secret = env.TURNSTILE_SECRET_KEY;
	if (!secret) {
		console.error('Turnstile not configured: set TURNSTILE_SECRET_KEY.');
		return false;
	}
	if (!token) return false;

	const body = new URLSearchParams({ secret, response: token });
	if (remoteip) body.set('remoteip', remoteip);

	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body
		});
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch (err) {
		console.error('Turnstile verify request failed:', err);
		return false;
	}
}
