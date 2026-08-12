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

export interface SizePreset {
	label: string;
	widthIn: number;
	heightIn: number;
}

export interface FinishOption {
	id: string;
	label: string;
	priceDeltaCents: number;
}

export const pricingConfig: PricingConfig = {
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

export const MAX_PRINT_SIDE_IN = 45;
export const MAX_CART_ITEMS = 20;
export const MAX_ITEM_QUANTITY = 50;

export const sizePresets: SizePreset[] = [
	{ label: '8 x 10 in', widthIn: 8, heightIn: 10 },
	{ label: '12 x 16 in', widthIn: 12, heightIn: 16 },
	{ label: '18 x 24 in', widthIn: 18, heightIn: 24 },
	{ label: '24 x 36 in', widthIn: 24, heightIn: 36 }
];

export const finishOptions: FinishOption[] = [
	{ id: 'matte', label: 'Matte', priceDeltaCents: 0 },
	{ id: 'glossy', label: 'Glossy', priceDeltaCents: 1500 },
	{ id: 'canvas', label: 'Canvas', priceDeltaCents: 3500 }
];
