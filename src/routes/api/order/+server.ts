import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin, PRINT_ORDERS_TABLE, ORDER_ITEMS_TABLE } from '$lib/server/supabase';
import { artworkPath, listUploadedArtworkNames } from '$lib/server/artwork';
import { isValidOrderId } from '$lib/server/order-id';
import { verifySession, MIN_SUBMIT_MS } from '$lib/server/security';
import { calculateOrderTotal, toInches, type OrderTotal } from '$lib/pricing/calculate';
import {
	addOnOptions,
	COLORED_MARGIN_OPTION_ID,
	MAX_PRINT_SIDE_IN,
	MAX_CART_ITEMS,
	MAX_ITEM_QUANTITY,
	MARGIN_STEPS_IN,
	MARGIN_DEFAULT_IN
} from '$lib/pricing/config';
import { createDraftOrder, lookupDiscountCode } from '$lib/server/shopify';
import { computeDiscountCents } from '$lib/pricing/discount';

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

interface ValidatedItem {
	projectName: string;
	marginIn: number;
	total: OrderTotal;
	artworkPath: string;
	artworkFileName: string;
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

	if (!isValidOrderId(body.orderId)) {
		return fail('Invalid request body.');
	}
	const orderId = body.orderId;

	if (!Array.isArray(body.items) || body.items.length === 0) {
		return fail('Add at least one print before checking out.');
	}
	if (body.items.length > MAX_CART_ITEMS) {
		return fail(`You can order up to ${MAX_CART_ITEMS} prints at a time.`);
	}

	let supabase;
	try {
		supabase = getSupabaseAdmin();
	} catch (err) {
		console.error(err);
		return fail('Server is not configured to accept orders yet.', 500);
	}

	const validated: ValidatedItem[] = [];
	for (let i = 0; i < body.items.length; i++) {
		const raw = body.items[i];
		const projectName = String(raw?.projectName ?? '').trim();
		if (!projectName) {
			return fail('Give this print a name first.');
		}
		const rawWidth = Number(raw?.rawWidth);
		const rawHeight = Number(raw?.rawHeight);
		const rawUnit = raw?.rawUnit === 'cm' ? 'cm' : 'in';
		const optionIds: string[] = Array.isArray(raw?.optionIds) ? raw.optionIds.map((id: unknown) => String(id)) : [];
		const rawMarginIn = Number(raw?.marginIn);
		const marginIn = MARGIN_STEPS_IN.includes(rawMarginIn) ? rawMarginIn : MARGIN_DEFAULT_IN;
		const quantity = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(Number(raw?.quantity) || 1)));

		if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawWidth <= 0 || rawHeight <= 0) {
			return fail('Please provide a valid size.');
		}
		if (!optionIds.every((id) => addOnOptions.some((o) => o.id === id))) {
			return fail('Please choose valid options.');
		}

		let marginColor: string | null = null;
		if (optionIds.includes(COLORED_MARGIN_OPTION_ID)) {
			const rawColor = String(raw?.marginColor ?? '');
			if (!HEX_COLOR_RE.test(rawColor)) {
				return fail('Please choose a valid margin color.');
			}
			marginColor = rawColor.toLowerCase();
		}

		const widthIn = toInches(rawWidth, rawUnit);
		const heightIn = toInches(rawHeight, rawUnit);

		if (widthIn > MAX_PRINT_SIDE_IN || heightIn > MAX_PRINT_SIDE_IN) {
			return fail(`${MAX_PRINT_SIDE_IN} in is the largest side we can print.`);
		}

		const artworkFileName = String(raw?.artworkFileName ?? '').trim();
		const artworkPathClaim = String(raw?.artworkPath ?? '').trim();
		if (!artworkFileName || !artworkPathClaim) {
			return fail('Upload your artwork first.');
		}
		if (artworkPathClaim !== artworkPath(orderId, i, artworkFileName)) {
			return fail('Artwork upload could not be verified. Please try again.');
		}

		validated.push({
			projectName,
			marginIn,
			total: calculateOrderTotal(widthIn, heightIn, optionIds, quantity, undefined, undefined, undefined, marginColor),
			artworkPath: artworkPathClaim,
			artworkFileName
		});
	}

	try {
		const uploadedNames = await listUploadedArtworkNames(orderId);
		const allUploaded = validated.every((v) => uploadedNames.has(v.artworkPath.split('/').pop()!));
		if (!allUploaded) {
			return fail('Artwork upload did not complete. Please try again.');
		}
	} catch (err) {
		console.error('Could not verify uploaded artwork:', err);
		return fail('Could not verify uploaded artwork. Please try again.', 500);
	}

	const totalPriceCents = validated.reduce((sum, v) => sum + v.total.totalPriceCents, 0);

	const discountCode = String(body.discountCode ?? '').trim();
	let discount: (Awaited<ReturnType<typeof lookupDiscountCode>> & { code: string }) | undefined;
	if (discountCode) {
		try {
			const info = await lookupDiscountCode(discountCode);
			discount = { ...info, code: discountCode };
		} catch (err) {
			return fail(err instanceof Error ? err.message : "That discount code isn't valid.");
		}
	}
	const discountCents = discount ? computeDiscountCents(totalPriceCents, discount) : 0;

	const { data: inserted, error: insertError } = await supabase
		.from(PRINT_ORDERS_TABLE)
		.insert({
			id: orderId,
			total_price_cents: totalPriceCents,
			discount_code: discount?.code ?? null,
			discount_cents: discountCents,
			status: 'pending'
		})
		.select('id')
		.single();

	if (insertError || !inserted) {
		console.error('Insert failed:', insertError);
		return fail('Could not save your order. Please try again.', 500);
	}

	const { error: itemsInsertError } = await supabase.from(ORDER_ITEMS_TABLE).insert(
		validated.map((v) => ({
			order_id: orderId,
			project_name: v.projectName || null,
			width_in: v.total.billableWidthIn,
			height_in: v.total.billableHeightIn,
			sq_in: v.total.sqIn,
			base_price_cents: v.total.basePriceCents,
			options: v.total.options,
			margin_in: v.marginIn,
			quantity: v.total.quantity,
			unit_price_cents: v.total.unitPriceCents,
			total_price_cents: v.total.totalPriceCents,
			artwork_path: v.artworkPath,
			artwork_file_name: v.artworkFileName
		}))
	);

	if (itemsInsertError) {
		console.error('Order items insert failed:', itemsInsertError);
		return fail('Could not save your order. Please try again.', 500);
	}

	try {
		const draft = await createDraftOrder({
			items: validated.map((v) => ({
				projectName: v.projectName,
				widthIn: v.total.billableWidthIn,
				heightIn: v.total.billableHeightIn,
				options: v.total.options,
				marginIn: v.marginIn,
				quantity: v.total.quantity,
				unitPriceCents: v.total.unitPriceCents
			})),
			discount
		});

		await supabase
			.from(PRINT_ORDERS_TABLE)
			.update({
				status: 'draft_created',
				shopify_draft_order_id: draft.id,
				shopify_invoice_url: draft.invoiceUrl
			})
			.eq('id', inserted.id);

		return json({ ok: true, invoiceUrl: draft.invoiceUrl, orderId: inserted.id });
	} catch (err) {
		console.error('Shopify draft order failed:', err);
		await supabase.from(PRINT_ORDERS_TABLE).update({ status: 'failed' }).eq('id', inserted.id);
		return fail('Could not start checkout. Please try again.', 500);
	}
};
