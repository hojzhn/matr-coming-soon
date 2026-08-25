import { calculateOrderTotal, type OrderLineItemOption } from '$lib/pricing/calculate';
import { MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from '$lib/pricing/config';
import { orderContent } from '$lib/content';
import { toast } from '$lib/toast/toast.svelte';
import * as persistence from './persistence';

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
	marginColor?: string | null;
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

	constructor() {
		if (typeof window !== 'undefined') void this.hydrate();
	}

	private async hydrate(): Promise<void> {
		const stored = persistence.loadCartMeta();
		if (!stored) return;

		const sanitized = stored.items.slice(0, MAX_CART_ITEMS).map(
			(item): CartItem => ({
				id: item.id,
				projectName: item.projectName,
				rawWidth: item.rawWidth,
				rawHeight: item.rawHeight,
				rawUnit: item.rawUnit,
				widthIn: item.widthIn,
				heightIn: item.heightIn,
				basePriceCents: item.basePriceCents,
				options: item.options,
				marginIn: item.marginIn,
				quantity: Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(item.quantity) || 1)),
				unitPriceCents: item.unitPriceCents,
				fileName: item.fileName,
				previewUrl: null,
				file: null
			})
		);

		this.items = sanitized;
		this.discount = stored.discount;

		let restoreFailed = false;
		for (const meta of stored.items) {
			if (!meta.hasFile) continue;
			const file = await persistence.loadFile(meta.id);
			const target = this.items.find((i) => i.id === meta.id);
			if (!target) continue;
			if (!file) {
				this.items = this.items.filter((i) => i.id !== meta.id);
				restoreFailed = true;
				continue;
			}
			target.file = file;
			if (file.type.startsWith('image/')) target.previewUrl = URL.createObjectURL(file);
		}

		if (restoreFailed) toast.show(orderContent.cart.artworkRestoreFailedToast);
	}

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

		const total = calculateOrderTotal(
			input.widthIn,
			input.heightIn,
			input.optionIds,
			input.quantity,
			undefined,
			undefined,
			undefined,
			input.marginColor
		);
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

		if (input.file) void persistence.saveFile(id, input.file);
		persistence.scheduleSaveCartMeta(this.items, this.discount);

		return { ok: true, id };
	}

	remove(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
		this.items = this.items.filter((i) => i.id !== id);
		void persistence.deleteFile(id);
		persistence.scheduleSaveCartMeta(this.items, this.discount);
	}

	applyDiscount(discount: AppliedDiscount): void {
		this.discount = discount;
		persistence.scheduleSaveCartMeta(this.items, this.discount);
	}

	removeDiscount(): void {
		this.discount = null;
		persistence.scheduleSaveCartMeta(this.items, this.discount);
	}

	updateQuantity(id: string, quantity: number): void {
		const item = this.items.find((i) => i.id === id);
		if (!item) return;
		const clamped = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(quantity) || 1));
		item.quantity = clamped;
		persistence.scheduleSaveCartMeta(this.items, this.discount);
	}

	clear(): void {
		for (const item of this.items) {
			if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
		}
		this.items = [];
		this.discount = null;
		persistence.flushScheduledSave();
		persistence.clearCartMeta();
		void persistence.clearFiles();
	}
}

export const cart = new CartStore();
