import { describe, expect, it } from 'vitest';
import {
	calculateOrderTotal,
	calculatePriceCents,
	cmToInches,
	priceAddOnCents,
	resolveAddOns,
	toInches
} from './calculate';
import { pricingConfig, STRETCH_SERVICE_OPTION_ID } from './config';
import type { AddOnOption, PricingConfig } from './config';

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

const options: AddOnOption[] = [
	{ id: 'varnish', label: 'Varnish', priceDeltaCents: 1500, icon: 'droplet' },
	{ id: 'stretched', label: 'Stretched', priceDeltaCents: 0, icon: 'layers' }
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

describe('resolveAddOns', () => {
	it('resolves known ids to their option objects', () => {
		expect(resolveAddOns(['varnish'], options)).toEqual([options[0]]);
	});

	it('ignores unknown ids', () => {
		expect(resolveAddOns(['nonexistent'], options)).toEqual([]);
	});

	it('dedupes repeated ids', () => {
		expect(resolveAddOns(['varnish', 'varnish'], options)).toEqual([options[0]]);
	});

	it('resolves multiple ids in order, skipping duplicates and unknowns', () => {
		expect(resolveAddOns(['stretched', 'nonexistent', 'varnish'], options)).toEqual([
			options[1],
			options[0]
		]);
	});
});

describe('calculateOrderTotal', () => {
	it('adds selected add-on deltas to the base price for the unit price', () => {
		const result = calculateOrderTotal(8, 10, ['varnish'], 1, cfg, options, {});
		expect(result.basePriceCents).toBe(12900);
		expect(result.unitPriceCents).toBe(12900 + 1500);
		expect(result.options).toEqual([options[0]]);
	});

	it('has no price impact from a zero-delta add-on', () => {
		const result = calculateOrderTotal(8, 10, ['stretched'], 1, cfg, options, {});
		expect(result.unitPriceCents).toBe(12900);
	});

	it('sums multiple add-on deltas', () => {
		const result = calculateOrderTotal(8, 10, ['varnish', 'stretched'], 1, cfg, options, {});
		expect(result.unitPriceCents).toBe(12900 + 1500);
	});

	it('has an empty options list and unchanged price when none are selected', () => {
		const result = calculateOrderTotal(8, 10, [], 1, cfg, options, {});
		expect(result.options).toEqual([]);
		expect(result.unitPriceCents).toBe(12900);
	});

	it('multiplies the unit price by quantity for the total', () => {
		const result = calculateOrderTotal(8, 10, [], 3, cfg, options, {});
		expect(result.quantity).toBe(3);
		expect(result.totalPriceCents).toBe(12900 * 3);
	});

	it('clamps quantity below 1 up to 1', () => {
		const result = calculateOrderTotal(8, 10, [], 0, cfg, options, {});
		expect(result.quantity).toBe(1);
	});

	it('rounds a fractional quantity', () => {
		const result = calculateOrderTotal(8, 10, [], 2.4, cfg, options, {});
		expect(result.quantity).toBe(2);
	});
});

describe('priceAddOnCents (varnish/stretch size-based engine)', () => {
	it('charges the min price at or below the first checkpoint (12x16)', () => {
		expect(priceAddOnCents({ id: 'varnish', label: 'Varnish', priceDeltaCents: 0, icon: 'droplet' }, 8, 10)).toBe(
			3500
		);
		expect(
			priceAddOnCents(
				{ id: STRETCH_SERVICE_OPTION_ID, label: 'Stretched', priceDeltaCents: 0, icon: 'layers' },
				12,
				16
			)
		).toBe(4500);
	});

	it('hits the middle checkpoint (24x24) exactly', () => {
		expect(priceAddOnCents({ id: 'varnish', label: 'Varnish', priceDeltaCents: 0, icon: 'droplet' }, 24, 24)).toBe(
			5900
		);
		expect(
			priceAddOnCents(
				{ id: STRETCH_SERVICE_OPTION_ID, label: 'Stretched', priceDeltaCents: 0, icon: 'layers' },
				24,
				24
			)
		).toBe(8500);
	});

	it('caps at the max checkpoint price beyond 36x36', () => {
		expect(priceAddOnCents({ id: 'varnish', label: 'Varnish', priceDeltaCents: 0, icon: 'droplet' }, 45, 45)).toBe(
			9900
		);
		expect(
			priceAddOnCents(
				{ id: STRETCH_SERVICE_OPTION_ID, label: 'Stretched', priceDeltaCents: 0, icon: 'layers' },
				45,
				45
			)
		).toBe(15000);
	});

	it('falls back to the static priceDeltaCents for options without a size-based config', () => {
		expect(priceAddOnCents({ id: 'outpaint', label: 'Outpaint', priceDeltaCents: 0, icon: 'expand' }, 40, 40)).toBe(
			0
		);
	});
});

describe('pricingConfig checkpoint prices', () => {
	it('prices 12x12 at $39', () => {
		expect(calculatePriceCents(12, 12, pricingConfig).priceCents).toBe(3900);
	});

	it('prices 24x24 at $109', () => {
		expect(calculatePriceCents(24, 24, pricingConfig).priceCents).toBe(10900);
	});

	it('prices 36x36 at $189', () => {
		expect(calculatePriceCents(36, 36, pricingConfig).priceCents).toBe(18900);
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
