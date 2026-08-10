import { pricingConfig, finishOptions, type PricingConfig, type FinishOption } from './config';

export interface PriceResult {
	billableWidthIn: number;
	billableHeightIn: number;
	sqIn: number;
	priceCents: number;
}

export interface OrderTotal {
	billableWidthIn: number;
	billableHeightIn: number;
	sqIn: number;
	finish: FinishOption;
	basePriceCents: number;
	unitPriceCents: number;
	quantity: number;
	totalPriceCents: number;
}

export function cmToInches(cm: number): number {
	return cm / 2.54;
}

export function toInches(value: number, unit: 'in' | 'cm'): number {
	return unit === 'cm' ? cmToInches(value) : value;
}

export function calculatePriceCents(
	widthIn: number,
	heightIn: number,
	cfg: PricingConfig = pricingConfig
): PriceResult {
	const w = Math.max(widthIn, cfg.minWidthIn);
	const h = Math.max(heightIn, cfg.minHeightIn);
	const sqIn = w * h;

	let price = cfg.minPrice;
	let lowerBound = cfg.zones[0].upToSqIn;

	for (const zone of cfg.zones.slice(1)) {
		if (sqIn > lowerBound) {
			const areaInZone = Math.min(sqIn, zone.upToSqIn) - lowerBound;
			price += areaInZone * zone.ratePerSqIn;
		}
		lowerBound = zone.upToSqIn;
	}

	return { billableWidthIn: w, billableHeightIn: h, sqIn, priceCents: Math.round(price * 100) };
}

export function formatPrice(cents: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function findFinish(finishId: string, options: FinishOption[] = finishOptions): FinishOption {
	return options.find((f) => f.id === finishId) ?? options[0];
}

export function calculateOrderTotal(
	widthIn: number,
	heightIn: number,
	finishId: string,
	quantity: number,
	cfg: PricingConfig = pricingConfig,
	options: FinishOption[] = finishOptions
): OrderTotal {
	const base = calculatePriceCents(widthIn, heightIn, cfg);
	const finish = findFinish(finishId, options);
	const unitPriceCents = base.priceCents + finish.priceDeltaCents;
	const qty = Math.max(1, Math.round(quantity));

	return {
		billableWidthIn: base.billableWidthIn,
		billableHeightIn: base.billableHeightIn,
		sqIn: base.sqIn,
		finish,
		basePriceCents: base.priceCents,
		unitPriceCents,
		quantity: qty,
		totalPriceCents: unitPriceCents * qty
	};
}
