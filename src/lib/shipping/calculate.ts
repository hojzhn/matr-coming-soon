import { STRETCH_SERVICE_OPTION_ID } from '$lib/pricing/config';
import { shippingConfig, type ShippingConfig, type WeightTier } from './config';

function tierValue(x: number, tiers: WeightTier[]): number {
	for (const tier of tiers) {
		if (x <= tier.upTo) return tier.weightLb;
	}
	return tiers[tiers.length - 1].weightLb;
}

function roundUpToIncrement(value: number, increment: number): number {
	return Math.ceil(value / increment) * increment;
}

export function calculateRolledWeightLb(
	widthIn: number,
	heightIn: number,
	cfg: ShippingConfig = shippingConfig
): number {
	const sqIn = widthIn * heightIn;
	const longestSideIn = Math.max(widthIn, heightIn);
	const printWeight = sqIn * cfg.paperWeightLbPerSqIn;
	const tubeWeight = tierValue(longestSideIn, cfg.tubeWeightTiers);
	return roundUpToIncrement(printWeight + tubeWeight + cfg.tubePackingLb, cfg.roundToLb);
}

export function calculateStretchedWeightLb(
	widthIn: number,
	heightIn: number,
	cfg: ShippingConfig = shippingConfig
): number {
	const sqIn = widthIn * heightIn;
	const perimeterIn = 2 * (widthIn + heightIn);
	const canvasWeight = sqIn * cfg.canvasWeightLbPerSqIn;
	const barWeight = perimeterIn * cfg.stretcherBarWeightLbPerIn;
	const boxWeight = tierValue(sqIn, cfg.boxWeightTiers);
	return roundUpToIncrement(canvasWeight + barWeight + cfg.stretchedHardwareLb + boxWeight, cfg.roundToLb);
}

export function calculateDimensionalWeightLb(
	widthIn: number,
	heightIn: number,
	isStretched: boolean,
	cfg: ShippingConfig = shippingConfig
): number {
	const dims = isStretched
		? [widthIn + cfg.boxPaddingIn, heightIn + cfg.boxPaddingIn, cfg.boxDepthIn]
		: [Math.max(widthIn, heightIn) + cfg.tubeExtraLengthIn, cfg.tubeDiameterIn, cfg.tubeDiameterIn];
	const volume = dims.reduce((total, side) => total * Math.ceil(side), 1);
	return roundUpToIncrement(Math.ceil(volume / cfg.dimDivisor), cfg.roundToLb);
}

export function calculateItemWeightLb(
	widthIn: number,
	heightIn: number,
	optionIds: string[],
	cfg: ShippingConfig = shippingConfig
): number {
	const isStretched = optionIds.includes(STRETCH_SERVICE_OPTION_ID);
	const actual = isStretched
		? calculateStretchedWeightLb(widthIn, heightIn, cfg)
		: calculateRolledWeightLb(widthIn, heightIn, cfg);
	return Math.max(actual, calculateDimensionalWeightLb(widthIn, heightIn, isStretched, cfg));
}

export interface WeightVariant {
	id: string;
	weightLb: number;
}

export function selectWeightVariant(variants: WeightVariant[], weightLb: number): WeightVariant | null {
	const sorted = variants.filter((v) => v.weightLb > 0).sort((a, b) => a.weightLb - b.weightLb);
	if (sorted.length === 0) return null;
	return sorted.find((v) => v.weightLb >= weightLb) ?? sorted[sorted.length - 1];
}
