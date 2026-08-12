export interface PricingZone {
	upToSqIn: number;
	ratePerSqIn: number;
}

export interface PricingConfig {
	minWidthIn: number;
	minHeightIn: number;
	minPrice: number;
	zones: PricingZone[];
}

export interface AddOnOption {
	id: string;
	label: string;
	priceDeltaCents: number;
}

export interface SizingMode {
	id: string;
	label: string;
}

// Bracket boundaries/rates are calibrated to hit exact checkpoint prices:
// 12x12 (144 sqin) = $39, 24x24 (576 sqin) = $109, 36x36 (1296 sqin) = $189.
// Each bracket's rate is the exact ($/sqin) needed to bridge one checkpoint to the next.
export const pricingConfig: PricingConfig = {
	minWidthIn: 8,
	minHeightIn: 10,
	minPrice: 39,
	zones: [
		{ upToSqIn: 144, ratePerSqIn: 0 },
		{ upToSqIn: 576, ratePerSqIn: 70 / 432 },
		{ upToSqIn: 1296, ratePerSqIn: 80 / 720 },
		{ upToSqIn: Infinity, ratePerSqIn: 1 / 12 }
	]
};

export const MAX_PRINT_SIDE_IN = 45;
export const MAX_CART_ITEMS = 20;
export const MAX_ITEM_QUANTITY = 50;

// "How to size the print" is a radio choice, not an add-on: "To Stretch" flags the print for
// the "To Stretch" production spec (0.5in outpaint + 3in margin) instead of "Normal", with no
// price difference either way — see shopify.ts/email.ts. "Stretched" (below) is a separate
// add-on for us performing the actual stretching, and only makes sense alongside "To Stretch"
// sizing (enforced in OrderForm.svelte's option picker).
export const NORMAL_SIZING_MODE = 'normal';
export const TO_STRETCH_SIZING_MODE = 'to-stretch';

export const sizingModes: SizingMode[] = [
	{ id: NORMAL_SIZING_MODE, label: 'Normal' },
	{ id: TO_STRETCH_SIZING_MODE, label: 'To Stretch' }
];

export const STRETCH_SERVICE_OPTION_ID = 'stretch-service';

export const addOnOptions: AddOnOption[] = [
	{ id: 'varnish', label: 'Varnish', priceDeltaCents: 1500 },
	{ id: STRETCH_SERVICE_OPTION_ID, label: 'Stretched', priceDeltaCents: 3000 }
];
