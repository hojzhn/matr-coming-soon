import { calculateOrderTotal } from '$lib/pricing/calculate';
import { MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from '$lib/pricing/config';

export interface CartItem {
	id: string;
	projectName: string;
	rawWidth: number;
	rawHeight: number;
	rawUnit: 'in' | 'cm';
	widthIn: number;
	heightIn: number;
	finishId: string;
	finishLabel: string;
	quantity: number;
	unitPriceCents: number;
	fileName: string | null;
	previewUrl: string | null;
}

export interface AddCartItemInput {
	projectName: string;
	rawWidth: number;
	rawHeight: number;
	rawUnit: 'in' | 'cm';
	widthIn: number;
	heightIn: number;
	finishId: string;
	quantity: number;
	fileName: string | null;
	previewUrl: string | null;
}

export type AddCartItemResult = { ok: true; id: string } | { ok: false; error: 'max-items' };

export class CartStore {
	items = $state<CartItem[]>([]);

	get count(): number {
		return this.items.length;
	}

	get subtotalCents(): number {
		return this.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
	}

	get isFull(): boolean {
		return this.items.length >= MAX_CART_ITEMS;
	}

	add(input: AddCartItemInput): AddCartItemResult {
		if (this.isFull) return { ok: false, error: 'max-items' };

		const total = calculateOrderTotal(input.widthIn, input.heightIn, input.finishId, input.quantity);
		const id = crypto.randomUUID();

		this.items.push({
			id,
			projectName: input.projectName,
			rawWidth: input.rawWidth,
			rawHeight: input.rawHeight,
			rawUnit: input.rawUnit,
			widthIn: total.billableWidthIn,
			heightIn: total.billableHeightIn,
			finishId: total.finish.id,
			finishLabel: total.finish.label,
			quantity: total.quantity,
			unitPriceCents: total.unitPriceCents,
			fileName: input.fileName,
			previewUrl: input.previewUrl
		});

		return { ok: true, id };
	}

	remove(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
		this.items = this.items.filter((i) => i.id !== id);
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
	}
}

export const cart = new CartStore();
