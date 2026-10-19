const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_RE.test(email);
}

export async function submitContact(payload: {
	name: string;
	email: string;
	message: string;
	company: string;
	formToken: string;
}): Promise<{ ok: boolean; error?: string }> {
	try {
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		return data.ok ? { ok: true } : { ok: false, error: data.error };
	} catch {
		return { ok: false };
	}
}
