import { describe, expect, it } from 'vitest';
import {
	calculateDimensionalWeightLb,
	calculateItemWeightLb,
	calculateRolledWeightLb,
	calculateStretchedWeightLb,
	selectWeightVariant
} from './calculate';
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
	tubeDiameterIn: 4,
	tubeExtraLengthIn: 4,
	boxPaddingIn: 4,
	boxDepthIn: 4,
	dimDivisor: 139,
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

describe('calculateDimensionalWeightLb', () => {
	it('sizes a rolled tube from the longest side plus extra length', () => {
		// tube 64x4x4 = 1024 cuin / 139 = 7.37 -> 8
		expect(calculateDimensionalWeightLb(60, 1, false, cfg)).toBe(8);
	});

	it('sizes a stretched box from the padded print and box depth', () => {
		// box 52x40x4 = 8320 cuin / 139 = 59.86 -> 60
		expect(calculateDimensionalWeightLb(48, 36, true, cfg)).toBe(60);
	});

	it('rounds fractional package sides up to whole inches', () => {
		// box 15x15x4 = 900 cuin / 139 = 6.47 -> 7
		expect(calculateDimensionalWeightLb(10.5, 10.5, true, cfg)).toBe(7);
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

	it('charges dimensional weight when it exceeds the actual weight', () => {
		expect(calculateItemWeightLb(60, 1, [], cfg)).toBe(8);
		expect(calculateItemWeightLb(48, 36, [STRETCH_SERVICE_OPTION_ID], cfg)).toBe(60);
	});
});

describe('selectWeightVariant', () => {
	const variants = [
		{ id: 'c', weightLb: 20 },
		{ id: 'a', weightLb: 5 },
		{ id: 'none', weightLb: 0 },
		{ id: 'b', weightLb: 10 }
	];

	it('picks the lightest tier that covers the weight', () => {
		expect(selectWeightVariant(variants, 3)?.id).toBe('a');
		expect(selectWeightVariant(variants, 5)?.id).toBe('a');
		expect(selectWeightVariant(variants, 5.5)?.id).toBe('b');
		expect(selectWeightVariant(variants, 12)?.id).toBe('c');
	});

	it('falls back to the heaviest tier when the weight exceeds every tier', () => {
		expect(selectWeightVariant(variants, 99)?.id).toBe('c');
	});

	it('returns null when no variant has a weight', () => {
		expect(selectWeightVariant([{ id: 'x', weightLb: 0 }], 3)).toBeNull();
	});
});
