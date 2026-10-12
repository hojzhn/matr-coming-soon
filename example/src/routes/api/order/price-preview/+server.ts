import { json, type RequestHandler } from '@sveltejs/kit';
import { calculateOrderTotal, toInches } from '$lib/pricing/calculate';
import { addOnOptions, COLORED_MARGIN_OPTION_ID, MAX_PRINT_SIDE_IN, MAX_ITEM_QUANTITY } from '$lib/pricing/config';
import { computeCompareAtTotalCents } from '$lib/server/pricing';

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

function fail(error: string, status = 400) {
	return json({ ok: false, error }, { status });
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body) return fail('Invalid request body.');

	const rawWidth = Number(body?.rawWidth);
	const rawHeight = Number(body?.rawHeight);
	const rawUnit = body?.rawUnit === 'cm' ? 'cm' : 'in';
	const optionIds: string[] = Array.isArray(body?.optionIds)
		? body.optionIds.map((id: unknown) => String(id))
		: [];
	const quantity = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(Number(body?.quantity) || 1)));

	if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawWidth <= 0 || rawHeight <= 0) {
		return fail('Please provide a valid size.');
	}
	if (!optionIds.every((id) => addOnOptions.some((o) => o.id === id))) {
		return fail('Please choose valid options.');
	}

	let marginColor: string | null = null;
	if (optionIds.includes(COLORED_MARGIN_OPTION_ID)) {
		const rawColor = String(body?.marginColor ?? '');
		if (HEX_COLOR_RE.test(rawColor)) marginColor = rawColor.toLowerCase();
	}

	const widthIn = toInches(rawWidth, rawUnit);
	const heightIn = toInches(rawHeight, rawUnit);
	if (widthIn > MAX_PRINT_SIDE_IN || heightIn > MAX_PRINT_SIDE_IN) {
		return fail(`${MAX_PRINT_SIDE_IN} in is the largest side we can print.`);
	}

	const total = calculateOrderTotal(widthIn, heightIn, optionIds, quantity, undefined, undefined, undefined, marginColor);

	return json({ ok: true, compareAtTotalCents: computeCompareAtTotalCents(total) });
};
