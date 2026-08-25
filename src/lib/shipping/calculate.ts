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

export function calculateItemWeightLb(
	widthIn: number,
	heightIn: number,
	optionIds: string[],
	cfg: ShippingConfig = shippingConfig
): number {
	const isStretched = optionIds.includes(STRETCH_SERVICE_OPTION_ID);
	return isStretched
		? calculateStretchedWeightLb(widthIn, heightIn, cfg)
		: calculateRolledWeightLb(widthIn, heightIn, cfg);
}
