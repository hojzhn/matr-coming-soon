import { describe, expect, it } from 'vitest';
import { calculateItemWeightLb, calculateRolledWeightLb, calculateStretchedWeightLb } from './calculate';
import { STRETCH_SERVICE_OPTION_ID } from '$lib/pricing/config';
import type { ShippingConfig } from './config';

const cfg: ShippingConfig = {
	paperWeightLbPerSqIn: 0.01,
	tubeWeightTiers: [
		{ upTo: 20, weightLb: 1 },
		{ upTo: Infinity, weightLb: 2 }
	],
	tubePackingLb: 0.5,
	canvasWeightLbPerSqIn: 0.02,
	stretcherBarWeightLbPerIn: 0.1,
	stretchedHardwareLb: 0.5,
	boxWeightTiers: [
		{ upTo: 200, weightLb: 2 },
		{ upTo: Infinity, weightLb: 4 }
	],
	roundToLb: 0.5
};

describe('calculateRolledWeightLb', () => {
	it('sums print material, tube tier, and packing, rounded up', () => {
		// 10x10 = 100 sqin -> 1lb print; longest side 10 -> tube tier 1lb; +0.5 packing = 2.5
		expect(calculateRolledWeightLb(10, 10, cfg)).toBeCloseTo(2.5);
	});

	it('moves to the next tube tier once the longest side crosses the boundary', () => {
		// 21x1 = 21 sqin -> 0.21lb print; longest side 21 -> tube tier 2lb; +0.5 packing = 2.71 -> rounds to 3
		expect(calculateRolledWeightLb(21, 1, cfg)).toBeCloseTo(3);
	});
});

describe('calculateStretchedWeightLb', () => {
	it('sums canvas, stretcher bars, hardware, and box tier, rounded up', () => {
		// 10x10 = 100 sqin -> 2lb canvas; perimeter 40 -> 4lb bars; +0.5 hardware; box tier 2lb = 8.5
		expect(calculateStretchedWeightLb(10, 10, cfg)).toBeCloseTo(8.5);
	});

	it('moves to the next box tier once the area crosses the boundary', () => {
		// 20x20 = 400 sqin -> 8lb canvas; perimeter 80 -> 8lb bars; +0.5 hardware; box tier 4lb = 20.5
		expect(calculateStretchedWeightLb(20, 20, cfg)).toBeCloseTo(20.5);
	});
});

describe('calculateItemWeightLb', () => {
	it('uses the rolled calculation when the stretch add-on is not selected', () => {
		expect(calculateItemWeightLb(10, 10, [], cfg)).toBe(calculateRolledWeightLb(10, 10, cfg));
	});

	it('uses the stretched calculation when the stretch add-on is selected', () => {
		expect(calculateItemWeightLb(10, 10, [STRETCH_SERVICE_OPTION_ID], cfg)).toBe(
			calculateStretchedWeightLb(10, 10, cfg)
		);
	});
});
