import { describe, expect, it } from 'vitest';
import { calculateOrderTotal, calculatePriceCents, cmToInches, findFinish, toInches } from './calculate';
import type { FinishOption, PricingConfig } from './config';

const cfg: PricingConfig = {
	minWidthIn: 8,
	minHeightIn: 10,
	minPrice: 129,
	zones: [
		{ upToSqIn: 80, ratePerSqIn: 0 },
		{ upToSqIn: 300, ratePerSqIn: 0.9 },
		{ upToSqIn: 800, ratePerSqIn: 0.65 },
		{ upToSqIn: Infinity, ratePerSqIn: 0.5 }
	]
};

const finishes: FinishOption[] = [
	{ id: 'matte', label: 'Matte', priceDeltaCents: 0 },
	{ id: 'glossy', label: 'Glossy', priceDeltaCents: 1500 }
];

describe('calculatePriceCents', () => {
	it('clamps below-minimum inputs to the minimum footprint and price', () => {
		const result = calculatePriceCents(2, 2, cfg);
		expect(result.billableWidthIn).toBe(8);
		expect(result.billableHeightIn).toBe(10);
		expect(result.sqIn).toBe(80);
		expect(result.priceCents).toBe(12900);
	});

	it('charges exactly minPrice at the zone-0 boundary (80 sqin)', () => {
		const result = calculatePriceCents(8, 10, cfg);
		expect(result.priceCents).toBe(12900);
	});

	it('is continuous across the 80/300 sqin boundary', () => {
		const just_below = calculatePriceCents(8, 300 / 8 - 0.001, cfg).priceCents;
		const just_above = calculatePriceCents(8, 300 / 8 + 0.001, cfg).priceCents;
		expect(Math.abs(just_above - just_below)).toBeLessThanOrEqual(2);
	});

	it('is continuous across the 300/800 sqin boundary', () => {
		const w = 20;
		const just_below = calculatePriceCents(w, 800 / w - 0.001, cfg).priceCents;
		const just_above = calculatePriceCents(w, 800 / w + 0.001, cfg).priceCents;
		expect(Math.abs(just_above - just_below)).toBeLessThanOrEqual(2);
	});

	it('applies the top-tier rate beyond the last finite boundary', () => {
		const result = calculatePriceCents(40, 40, cfg);
		const expected =
			cfg.minPrice + (300 - 80) * 0.9 + (800 - 300) * 0.65 + (1600 - 800) * 0.5;
		expect(result.priceCents).toBe(Math.round(expected * 100));
	});

	it('produces identical results across repeated calls with the same input', () => {
		const a = calculatePriceCents(24, 36, cfg);
		const b = calculatePriceCents(24, 36, cfg);
		expect(a).toEqual(b);
	});
});

describe('findFinish', () => {
	it('finds a finish by id', () => {
		expect(findFinish('glossy', finishes)).toEqual(finishes[1]);
	});

	it('falls back to the first option for an unknown id', () => {
		expect(findFinish('nonexistent', finishes)).toEqual(finishes[0]);
	});
});

describe('calculateOrderTotal', () => {
	it('adds the finish delta to the base price for the unit price', () => {
		const result = calculateOrderTotal(8, 10, 'glossy', 1, cfg, finishes);
		expect(result.basePriceCents).toBe(12900);
		expect(result.unitPriceCents).toBe(12900 + 1500);
	});

	it('multiplies the unit price by quantity for the total', () => {
		const result = calculateOrderTotal(8, 10, 'matte', 3, cfg, finishes);
		expect(result.quantity).toBe(3);
		expect(result.totalPriceCents).toBe(12900 * 3);
	});

	it('clamps quantity below 1 up to 1', () => {
		const result = calculateOrderTotal(8, 10, 'matte', 0, cfg, finishes);
		expect(result.quantity).toBe(1);
	});

	it('rounds a fractional quantity', () => {
		const result = calculateOrderTotal(8, 10, 'matte', 2.4, cfg, finishes);
		expect(result.quantity).toBe(2);
	});
});

describe('unit conversion', () => {
	it('converts cm to inches', () => {
		expect(cmToInches(2.54)).toBeCloseTo(1);
	});

	it('toInches passes inches through unchanged', () => {
		expect(toInches(12, 'in')).toBe(12);
	});

	it('toInches converts cm', () => {
		expect(toInches(25.4, 'cm')).toBeCloseTo(10);
	});
});
