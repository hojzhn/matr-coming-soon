import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem, AppliedDiscount } from './cart.svelte';

function createLocalStorageStub() {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		}
	};
}

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
	return {
		id: crypto.randomUUID(),
		projectName: 'Red Desert',
		rawWidth: 8,
		rawHeight: 10,
		rawUnit: 'in',
		widthIn: 8,
		heightIn: 10,
		basePriceCents: 3900,
		options: [],
		marginIn: 3,
		quantity: 1,
		unitPriceCents: 3900,
		fileName: null,
		previewUrl: null,
		file: null,
		...overrides
	};
}

describe('persistence (localStorage)', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('round-trips cart metadata through localStorage', async () => {
		vi.stubGlobal('window', { localStorage: createLocalStorageStub() });
		const persistence = await import('./persistence');

		const items = [makeItem(), makeItem({ fileName: 'art.png', file: new File([], 'art.png') })];
		const discount: AppliedDiscount = { code: 'SAVE10', title: '10% off', discountCents: 500 };

		persistence.saveCartMetaNow(items, discount);
		const loaded = persistence.loadCartMeta();

		expect(loaded?.discount).toEqual(discount);
		expect(loaded?.items.map((i) => i.id)).toEqual(items.map((i) => i.id));
		expect(loaded?.items[1].hasFile).toBe(true);
		expect(loaded?.items[0].hasFile).toBe(false);
	});

	it('returns null when nothing is stored', async () => {
		vi.stubGlobal('window', { localStorage: createLocalStorageStub() });
		const persistence = await import('./persistence');
		expect(persistence.loadCartMeta()).toBeNull();
	});

	it('discards the stored cart on a schema version mismatch', async () => {
		vi.stubGlobal('window', { localStorage: createLocalStorageStub() });
		const persistence = await import('./persistence');

		window.localStorage.setItem(
			'matr:cart:meta:v1',
			JSON.stringify({ version: 2, items: [], discount: null })
		);

		expect(persistence.loadCartMeta()).toBeNull();
	});

	it('drops individually malformed items but keeps valid ones', async () => {
		vi.stubGlobal('window', { localStorage: createLocalStorageStub() });
		const persistence = await import('./persistence');

		const good = makeItem();
		persistence.saveCartMetaNow([good], null);

		const raw = JSON.parse(window.localStorage.getItem('matr:cart:meta:v1')!);
		raw.items.push({ id: 'bad', notAValidItem: true });
		window.localStorage.setItem('matr:cart:meta:v1', JSON.stringify(raw));

		const loaded = persistence.loadCartMeta();
		expect(loaded?.items).toHaveLength(1);
		expect(loaded?.items[0].id).toBe(good.id);
	});

	it('treats storage as unavailable when window is undefined', async () => {
		const persistence = await import('./persistence');
		expect(persistence.hasLocalStorage()).toBe(false);
		expect(persistence.loadCartMeta()).toBeNull();
	});
});
