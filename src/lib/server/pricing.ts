import type { OrderTotal } from '$lib/pricing/calculate';

const COMPARE_AT_PRICE_RATE = 0.25;

export function computeCompareAtTotalCents(total: OrderTotal): number {
	const addOnsCents = total.unitPriceCents - total.basePriceCents;
	const inflatedBaseCents = Math.round(total.basePriceCents / (1 - COMPARE_AT_PRICE_RATE));
	const rawCents = (inflatedBaseCents + addOnsCents) * total.quantity;
	return Math.ceil(rawCents / 100) * 100;
}
