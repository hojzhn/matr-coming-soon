import { describe, expect, it } from 'vitest';
import { CartStore, type AddCartItemInput } from './cart.svelte';

function makeInput(overrides: Partial<AddCartItemInput> = {}): AddCartItemInput {
	return {
		projectName: '',
		rawWidth: 8,
		rawHeight: 10,
		rawUnit: 'in',
		widthIn: 8,
		heightIn: 10,
		optionIds: [],
		marginIn: 3,
		quantity: 1,
		fileName: null,
		previewUrl: null,
		...overrides
	};
}

describe('CartStore.add', () => {
	it('adds an item and returns its id', () => {
		const store = new CartStore();
		const result = store.add(makeInput());
		expect(result.ok).toBe(true);
		expect(store.count).toBe(1);
		expect(store.items[0].id).toBe(result.ok ? result.id : undefined);
	});

	it('computes pricing via calculateOrderTotal for the item', () => {
		const store = new CartStore();
		store.add(makeInput({ widthIn: 8, heightIn: 10, optionIds: [] }));
		expect(store.items[0].unitPriceCents).toBe(3900);
	});

	it('resolves selected add-ons onto the item', () => {
		const store = new CartStore();
		store.add(makeInput({ widthIn: 8, heightIn: 10, optionIds: ['varnish'] }));
		expect(store.items[0].unitPriceCents).toBe(3900 + 1500);
		expect(store.items[0].options.map((o) => o.id)).toEqual(['varnish']);
	});

	it('rejects adding beyond MAX_CART_ITEMS', () => {
		const store = new CartStore();
		for (let i = 0; i < 20; i++) store.add(makeInput());
		const result = store.add(makeInput());
		expect(result).toEqual({ ok: false, error: 'max-items' });
		expect(store.count).toBe(20);
	});
});

describe('CartStore.remove', () => {
	it('removes an item by id', () => {
		const store = new CartStore();
		const a = store.add(makeInput());
		store.add(makeInput());
		if (a.ok) store.remove(a.id);
		expect(store.count).toBe(1);
	});

	it('is a no-op for an unknown id', () => {
		const store = new CartStore();
		store.add(makeInput());
		store.remove('nonexistent');
		expect(store.count).toBe(1);
	});
});

describe('CartStore.updateQuantity', () => {
	it('updates the quantity of an item', () => {
		const store = new CartStore();
		const a = store.add(makeInput());
		if (a.ok) store.updateQuantity(a.id, 5);
		expect(store.items[0].quantity).toBe(5);
	});

	it('clamps quantity below 1 up to 1', () => {
		const store = new CartStore();
		const a = store.add(makeInput());
		if (a.ok) store.updateQuantity(a.id, 0);
		expect(store.items[0].quantity).toBe(1);
	});

	it('clamps quantity above MAX_ITEM_QUANTITY', () => {
		const store = new CartStore();
		const a = store.add(makeInput());
		if (a.ok) store.updateQuantity(a.id, 999);
		expect(store.items[0].quantity).toBe(50);
	});
});

describe('CartStore.subtotalCents', () => {
	it('sums unit price times quantity across items', () => {
		const store = new CartStore();
		store.add(makeInput({ widthIn: 8, heightIn: 10, optionIds: [], quantity: 2 }));
		store.add(makeInput({ widthIn: 8, heightIn: 10, optionIds: ['varnish'], quantity: 1 }));
		expect(store.subtotalCents).toBe(3900 * 2 + (3900 + 1500));
	});

	it('is zero for an empty cart', () => {
		const store = new CartStore();
		expect(store.subtotalCents).toBe(0);
	});
});

describe('CartStore.clear', () => {
	it('empties the cart', () => {
		const store = new CartStore();
		store.add(makeInput());
		store.add(makeInput());
		store.clear();
		expect(store.count).toBe(0);
	});
});
