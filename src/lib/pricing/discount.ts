export type DiscountValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface DiscountInfo {
	title: string;
	valueType: DiscountValueType;
	value: number;
}

export function computeDiscountCents(subtotalCents: number, discount: DiscountInfo): number {
	if (discount.valueType === 'PERCENTAGE') {
		return Math.min(subtotalCents, Math.round(subtotalCents * discount.value));
	}
	return Math.min(subtotalCents, Math.round(discount.value * 100));
}
