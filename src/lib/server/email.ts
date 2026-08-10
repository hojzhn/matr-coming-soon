import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { formatPrice } from '$lib/pricing/calculate';

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function row(label: string, valueHtml: string): string {
	return `<tr>
		<td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td>
		<td style="padding:6px 0;color:#0f172a;font-size:14px">${valueHtml}</td>
	</tr>`;
}

function wrap(heading: string, intro: string, tableHtml: string): string {
	return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto">
		<h2 style="font-size:18px;color:#0f172a;margin:0 0 4px">${escapeHtml(heading)}</h2>
		<p style="color:#64748b;font-size:13px;margin:0 0 16px">${escapeHtml(intro)}</p>
		<table style="border-collapse:collapse;width:100%">${tableHtml}</table>
	</div>`;
}

type SendArgs = { to: string; replyTo?: string; subject: string; html: string };

async function send({ to, replyTo, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
	const apiKey = env.RESEND_API_KEY;
	const from = env.ORDER_FROM_EMAIL;

	if (!apiKey || !from || !to) {
		const error = 'Email is not configured: set RESEND_API_KEY and ORDER_FROM_EMAIL.';
		console.error(error);
		return { ok: false, error };
	}

	try {
		const resend = new Resend(apiKey);
		const { error } = await resend.emails.send({ from, to, replyTo, subject, html });
		if (error) {
			console.error('Resend send failed:', error);
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (err) {
		console.error('Resend threw:', err);
		return { ok: false, error: 'Email send failed.' };
	}
}

export interface OrderNotificationArgs {
	projectName?: string;
	widthIn: number;
	heightIn: number;
	finishLabel: string;
	quantity: number;
	unitPriceCents: number;
	totalPriceCents: number;
	invoiceUrl: string;
}

export function sendOrderNotification(args: OrderNotificationArgs) {
	const to = env.ORDER_NOTIFICATION_EMAIL;
	if (!to) {
		console.error('ORDER_NOTIFICATION_EMAIL is not set.');
		return Promise.resolve({ ok: false, error: 'ORDER_NOTIFICATION_EMAIL is not set.' });
	}

	const table =
		(args.projectName ? row('Project', escapeHtml(args.projectName)) : '') +
		row('Size', `${args.widthIn} x ${args.heightIn} in`) +
		row('Finish', escapeHtml(args.finishLabel)) +
		row('Quantity', String(args.quantity)) +
		row('Unit price', formatPrice(args.unitPriceCents)) +
		row('Total', formatPrice(args.totalPriceCents)) +
		row('Invoice', `<a href="${escapeHtml(args.invoiceUrl)}" style="color:#0b8a3f">${escapeHtml(args.invoiceUrl)}</a>`);

	return send({
		to,
		subject: `New print order - ${args.widthIn} x ${args.heightIn} in`,
		html: wrap('New print order', `A new oil print order came in on matr labs.`, table)
	});
}

export function sendContactNotification(args: { name: string; email: string; message: string }) {
	const to = env.ORDER_NOTIFICATION_EMAIL;
	if (!to) {
		console.error('ORDER_NOTIFICATION_EMAIL is not set.');
		return Promise.resolve({ ok: false, error: 'ORDER_NOTIFICATION_EMAIL is not set.' });
	}

	const table =
		row('Name', escapeHtml(args.name)) +
		row('Email', `<a href="mailto:${escapeHtml(args.email)}" style="color:#0b8a3f">${escapeHtml(args.email)}</a>`) +
		row('Message', escapeHtml(args.message).replace(/\n/g, '<br>'));

	return send({
		to,
		replyTo: args.email,
		subject: `New message from ${args.name}`,
		html: wrap('New contact message', 'A new message came in through the matr labs contact form.', table)
	});
}

export function sendNewsletterNotification(args: { email: string }) {
	const to = env.ORDER_NOTIFICATION_EMAIL;
	if (!to) {
		console.error('ORDER_NOTIFICATION_EMAIL is not set.');
		return Promise.resolve({ ok: false, error: 'ORDER_NOTIFICATION_EMAIL is not set.' });
	}

	const table = row(
		'Email',
		`<a href="mailto:${escapeHtml(args.email)}" style="color:#0b8a3f">${escapeHtml(args.email)}</a>`
	);

	return send({
		to,
		replyTo: args.email,
		subject: 'New newsletter signup',
		html: wrap('New newsletter signup', 'A new email joined the matr launch list.', table)
	});
}
