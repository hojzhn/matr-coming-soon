import { calculateOrderTotal, type OrderLineItemOption } from '$lib/pricing/calculate';
import { MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from '$lib/pricing/config';

export interface CartItem {
	id: string;
	projectName: string;
	rawWidth: number;
	rawHeight: number;
	rawUnit: 'in' | 'cm';
	widthIn: number;
	heightIn: number;
	basePriceCents: number;
	options: OrderLineItemOption[];
	marginIn: number;
	quantity: number;
	unitPriceCents: number;
	fileName: string | null;
	previewUrl: string | null;
	file: File | null;
}

export interface AddCartItemInput {
	projectName: string;
	rawWidth: number;
	rawHeight: number;
	rawUnit: 'in' | 'cm';
	widthIn: number;
	heightIn: number;
	optionIds: string[];
	marginIn: number;
	quantity: number;
	fileName: string | null;
	previewUrl: string | null;
	file: File | null;
}

export type AddCartItemResult = { ok: true; id: string } | { ok: false; error: 'max-items' };

export interface AppliedDiscount {
	code: string;
	title: string;
	discountCents: number;
}

export class CartStore {
	items = $state<CartItem[]>([]);
	discount = $state<AppliedDiscount | null>(null);

	get count(): number {
		return this.items.length;
	}

	get subtotalCents(): number {
		return this.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
	}

	get discountCents(): number {
		return this.discount ? Math.min(this.discount.discountCents, this.subtotalCents) : 0;
	}

	get totalCents(): number {
		return this.subtotalCents - this.discountCents;
	}

	get isFull(): boolean {
		return this.items.length >= MAX_CART_ITEMS;
	}

	add(input: AddCartItemInput): AddCartItemResult {
		if (this.isFull) return { ok: false, error: 'max-items' };

		const total = calculateOrderTotal(input.widthIn, input.heightIn, input.optionIds, input.quantity);
		const id = crypto.randomUUID();

		this.items.push({
			id,
			projectName: input.projectName,
			rawWidth: input.rawWidth,
			rawHeight: input.rawHeight,
			rawUnit: input.rawUnit,
			widthIn: total.billableWidthIn,
			heightIn: total.billableHeightIn,
			basePriceCents: total.basePriceCents,
			options: total.options,
			marginIn: input.marginIn,
			quantity: total.quantity,
			unitPriceCents: total.unitPriceCents,
			fileName: input.fileName,
			previewUrl: input.previewUrl,
			file: input.file
		});

		return { ok: true, id };
	}

	remove(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
		this.items = this.items.filter((i) => i.id !== id);
	}

	applyDiscount(discount: AppliedDiscount): void {
		this.discount = discount;
	}

	removeDiscount(): void {
		this.discount = null;
	}

	updateQuantity(id: string, quantity: number): void {
		const item = this.items.find((i) => i.id === id);
		if (!item) return;
		const clamped = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(quantity) || 1));
		item.quantity = clamped;
	}

	clear(): void {
		for (const item of this.items) {
			if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
		}
		this.items = [];
		this.discount = null;
	}
}

export const cart = new CartStore();
