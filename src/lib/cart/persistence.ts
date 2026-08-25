import type { OrderLineItemOption } from '$lib/pricing/calculate';
import type { CartItem, AppliedDiscount } from './cart.svelte';

const SCHEMA_VERSION = 1;
const META_STORAGE_KEY = 'matr:cart:meta:v1';
const DB_NAME = 'matr-cart-store';
const DB_VERSION = 1;
const FILES_STORE = 'files';
const SAVE_DEBOUNCE_MS = 250;

export interface PersistedCartItemV1 {
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
	hasFile: boolean;
}

export interface PersistedCartV1 {
	version: 1;
	items: PersistedCartItemV1[];
	discount: AppliedDiscount | null;
}

let localStorageAvailable: boolean | null = null;

export function hasLocalStorage(): boolean {
	if (localStorageAvailable !== null) return localStorageAvailable;
	if (typeof window === 'undefined') return (localStorageAvailable = false);
	try {
		const probeKey = '__matr_storage_probe__';
		window.localStorage.setItem(probeKey, '1');
		window.localStorage.removeItem(probeKey);
		localStorageAvailable = true;
	} catch {
		localStorageAvailable = false;
	}
	return localStorageAvailable;
}

let indexedDbAvailable: boolean | null = null;

export function hasIndexedDb(): boolean {
	if (indexedDbAvailable !== null) return indexedDbAvailable;
	indexedDbAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
	return indexedDbAvailable;
}

function isOrderLineItemOption(value: unknown): value is OrderLineItemOption {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return typeof v.id === 'string' && typeof v.label === 'string' && typeof v.priceDeltaCents === 'number';
}

function isValidPersistedItem(value: unknown): value is PersistedCartItemV1 {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.id === 'string' &&
		typeof v.projectName === 'string' &&
		typeof v.rawWidth === 'number' &&
		typeof v.rawHeight === 'number' &&
		(v.rawUnit === 'in' || v.rawUnit === 'cm') &&
		typeof v.widthIn === 'number' &&
		typeof v.heightIn === 'number' &&
		typeof v.basePriceCents === 'number' &&
		Array.isArray(v.options) &&
		v.options.every(isOrderLineItemOption) &&
		typeof v.marginIn === 'number' &&
		typeof v.quantity === 'number' &&
		typeof v.unitPriceCents === 'number' &&
		(typeof v.fileName === 'string' || v.fileName === null) &&
		typeof v.hasFile === 'boolean'
	);
}

function isValidDiscount(value: unknown): value is AppliedDiscount | null {
	if (value === null) return true;
	if (typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return typeof v.code === 'string' && typeof v.title === 'string' && typeof v.discountCents === 'number';
}

export function loadCartMeta(): PersistedCartV1 | null {
	if (!hasLocalStorage()) return null;
	try {
		const raw = window.localStorage.getItem(META_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.items)) return null;
		const discount = isValidDiscount(parsed.discount) ? parsed.discount : null;
		return {
			version: SCHEMA_VERSION,
			items: parsed.items.filter(isValidPersistedItem),
			discount
		};
	} catch {
		return null;
	}
}

function serializeCart(items: CartItem[], discount: AppliedDiscount | null): PersistedCartV1 {
	return {
		version: SCHEMA_VERSION,
		items: items.map((item) => ({
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
			quantity: item.quantity,
			unitPriceCents: item.unitPriceCents,
			fileName: item.fileName,
			hasFile: item.file !== null
		})),
		discount
	};
}

export function saveCartMetaNow(items: CartItem[], discount: AppliedDiscount | null): void {
	if (!hasLocalStorage()) return;
	try {
		window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(serializeCart(items, discount)));
	} catch {
		// Storage full or unavailable — cart stays in-memory for this session.
	}
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSaveCartMeta(items: CartItem[], discount: AppliedDiscount | null): void {
	if (!hasLocalStorage()) return;
	if (saveTimer) clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		saveTimer = null;
		saveCartMetaNow(items, discount);
	}, SAVE_DEBOUNCE_MS);
}

export function flushScheduledSave(): void {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
}

export function clearCartMeta(): void {
	flushScheduledSave();
	if (!hasLocalStorage()) return;
	try {
		window.localStorage.removeItem(META_STORAGE_KEY);
	} catch {
		// Ignore — nothing more we can do if storage is unavailable.
	}
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
	if (!hasIndexedDb()) return Promise.resolve(null);
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve) => {
		try {
			const request = window.indexedDB.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = () => {
				if (!request.result.objectStoreNames.contains(FILES_STORE)) {
					request.result.createObjectStore(FILES_STORE);
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => resolve(null);
			request.onblocked = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
	return dbPromise;
}

export async function saveFile(id: string, file: File): Promise<void> {
	const db = await openDb();
	if (!db) return;
	await new Promise<void>((resolve) => {
		try {
			const tx = db.transaction(FILES_STORE, 'readwrite');
			tx.objectStore(FILES_STORE).put(file, id);
			tx.oncomplete = () => resolve();
			tx.onerror = () => resolve();
			tx.onabort = () => resolve();
		} catch {
			resolve();
		}
	});
}

export async function loadFile(id: string): Promise<File | null> {
	const db = await openDb();
	if (!db) return null;
	return new Promise<File | null>((resolve) => {
		try {
			const tx = db.transaction(FILES_STORE, 'readonly');
			const request = tx.objectStore(FILES_STORE).get(id);
			request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
			request.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
}

export async function deleteFile(id: string): Promise<void> {
	const db = await openDb();
	if (!db) return;
	await new Promise<void>((resolve) => {
		try {
			const tx = db.transaction(FILES_STORE, 'readwrite');
			tx.objectStore(FILES_STORE).delete(id);
			tx.oncomplete = () => resolve();
			tx.onerror = () => resolve();
			tx.onabort = () => resolve();
		} catch {
			resolve();
		}
	});
}

export async function clearFiles(): Promise<void> {
	const db = await openDb();
	if (!db) return;
	await new Promise<void>((resolve) => {
		try {
			const tx = db.transaction(FILES_STORE, 'readwrite');
			tx.objectStore(FILES_STORE).clear();
			tx.oncomplete = () => resolve();
			tx.onerror = () => resolve();
			tx.onabort = () => resolve();
		} catch {
			resolve();
		}
	});
}
