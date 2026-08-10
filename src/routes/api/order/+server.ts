import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin, PRINT_ORDERS_TABLE } from '$lib/server/supabase';
import { verifySession, MIN_SUBMIT_MS } from '$lib/server/security';
import { calculateOrderTotal, toInches } from '$lib/pricing/calculate';
import { finishOptions, MAX_PRINT_SIDE_IN } from '$lib/pricing/config';
import { createDraftOrder } from '$lib/server/shopify';
import { sendOrderNotification } from '$lib/server/email';

const MAX_QUANTITY = 50;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	if (String(body.company ?? '').trim() !== '') {
		return fail('Unable to process request.');
	}

	const session = verifySession(String(body.formToken ?? ''));
	if (!session.ok || session.ageMs < MIN_SUBMIT_MS) {
		return fail('Unable to process request.');
	}

	const projectName = String(body.projectName ?? '').trim();
	const rawWidth = Number(body.rawWidth);
	const rawHeight = Number(body.rawHeight);
	const rawUnit = body.rawUnit === 'cm' ? 'cm' : 'in';
	const finishId = String(body.finishId ?? finishOptions[0].id);
	const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number(body.quantity) || 1)));

	if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawWidth <= 0 || rawHeight <= 0) {
		return fail('Please provide a valid size.');
	}
	if (!finishOptions.some((f) => f.id === finishId)) return fail('Please choose a valid finish.');

	const widthIn = toInches(rawWidth, rawUnit);
	const heightIn = toInches(rawHeight, rawUnit);

	if (widthIn > MAX_PRINT_SIDE_IN || heightIn > MAX_PRINT_SIDE_IN) {
		return fail(`${MAX_PRINT_SIDE_IN} in is the largest side we can print.`);
	}

	const total = calculateOrderTotal(widthIn, heightIn, finishId, quantity);

	let supabase;
	try {
		supabase = getSupabaseAdmin();
	} catch (err) {
		console.error(err);
		return fail('Server is not configured to accept orders yet.', 500);
	}

	const { data: inserted, error: insertError } = await supabase
		.from(PRINT_ORDERS_TABLE)
		.insert({
			project_name: projectName || null,
			raw_width: rawWidth,
			raw_height: rawHeight,
			raw_unit: rawUnit,
			width_in: total.billableWidthIn,
			height_in: total.billableHeightIn,
			sq_in: total.sqIn,
			finish: total.finish.id,
			quantity: total.quantity,
			price_cents: total.unitPriceCents,
			total_price_cents: total.totalPriceCents,
			status: 'pending'
		})
		.select('id')
		.single();

	if (insertError || !inserted) {
		console.error('Insert failed:', insertError);
		return fail('Could not save your order. Please try again.', 500);
	}

	try {
		const draft = await createDraftOrder({
			projectName,
			widthIn: total.billableWidthIn,
			heightIn: total.billableHeightIn,
			finishLabel: total.finish.label,
			quantity: total.quantity,
			unitPriceCents: total.unitPriceCents
		});

		await supabase
			.from(PRINT_ORDERS_TABLE)
			.update({
				status: 'draft_created',
				shopify_draft_order_id: draft.id,
				shopify_invoice_url: draft.invoiceUrl
			})
			.eq('id', inserted.id);

		sendOrderNotification({
			projectName,
			widthIn: total.billableWidthIn,
			heightIn: total.billableHeightIn,
			finishLabel: total.finish.label,
			quantity: total.quantity,
			unitPriceCents: total.unitPriceCents,
			totalPriceCents: total.totalPriceCents,
			invoiceUrl: draft.invoiceUrl
		}).catch((err) => console.error('Order notification failed:', err));

		return json({ ok: true, invoiceUrl: draft.invoiceUrl });
	} catch (err) {
		console.error('Shopify draft order failed:', err);
		await supabase.from(PRINT_ORDERS_TABLE).update({ status: 'failed' }).eq('id', inserted.id);
		return fail('Could not start checkout. Please try again.', 500);
	}
};
