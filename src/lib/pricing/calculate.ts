import {
	pricingConfig,
	addOnOptions,
	addOnPricingConfigs,
	type PricingConfig,
	type AddOnOption
} from './config';

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
	basePriceCents: number;
	options: AddOnOption[];
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

export function formatMarginStep(step: number): string {
	const whole = Math.trunc(step);
	if (step - whole !== 0.5) return String(step);
	return whole === 0 ? '½' : `${whole}½`;
}

export function resolveAddOns(optionIds: string[], options: AddOnOption[] = addOnOptions): AddOnOption[] {
	const seen = new Set<string>();
	const resolved: AddOnOption[] = [];
	for (const id of optionIds) {
		if (seen.has(id)) continue;
		const match = options.find((o) => o.id === id);
		if (!match) continue;
		seen.add(id);
		resolved.push(match);
	}
	return resolved;
}

export function priceAddOnCents(
	option: AddOnOption,
	widthIn: number,
	heightIn: number,
	configs: Partial<Record<string, PricingConfig>> = addOnPricingConfigs
): number {
	const cfg = configs[option.id];
	return cfg ? calculatePriceCents(widthIn, heightIn, cfg).priceCents : option.priceDeltaCents;
}

export function calculateOrderTotal(
	widthIn: number,
	heightIn: number,
	optionIds: string[],
	quantity: number,
	cfg: PricingConfig = pricingConfig,
	options: AddOnOption[] = addOnOptions,
	addOnConfigs: Partial<Record<string, PricingConfig>> = addOnPricingConfigs
): OrderTotal {
	const base = calculatePriceCents(widthIn, heightIn, cfg);
	const selected = resolveAddOns(optionIds, options).map((o) => ({
		...o,
		priceDeltaCents: priceAddOnCents(o, base.billableWidthIn, base.billableHeightIn, addOnConfigs)
	}));
	const addOnsCents = selected.reduce((sum, o) => sum + o.priceDeltaCents, 0);
	const unitPriceCents = base.priceCents + addOnsCents;
	const qty = Math.max(1, Math.round(quantity));

	return {
		billableWidthIn: base.billableWidthIn,
		billableHeightIn: base.billableHeightIn,
		sqIn: base.sqIn,
		basePriceCents: base.priceCents,
		options: selected,
		unitPriceCents,
		quantity: qty,
		totalPriceCents: unitPriceCents * qty
	};
}
