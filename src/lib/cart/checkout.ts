import { orderContent } from '$lib/content';
import { COLORED_MARGIN_OPTION_ID } from '$lib/pricing/config';
import { cart, type CartItem } from './cart.svelte';
import { beginAwaitingPayment } from './checkout-status.svelte';

export type CheckoutResult = { ok: true } | { ok: false; error: string };

interface UploadTarget {
	index: number;
	path: string;
	signedUrl: string;
}

async function uploadArtwork(
	formToken: string,
	itemsWithFiles: { item: CartItem; index: number }[]
): Promise<{ orderId: string; paths: Map<number, string> } | { error: string }> {
	const res = await fetch('/api/order/upload-url', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			formToken,
			files: itemsWithFiles.map(({ item, index }) => ({
				index,
				fileName: item.file!.name,
				fileType: item.file!.type,
				fileSize: item.file!.size
			}))
		})
	});
	const data = await res.json();
	if (!data.ok) return { error: data.error || orderContent.cart.errorGeneric };

	const uploads: UploadTarget[] = data.uploads;
	const paths = new Map<number, string>();

	await Promise.all(
		uploads.map(async (target) => {
			const { item } = itemsWithFiles.find(({ index }) => index === target.index)!;
			const putRes = await fetch(target.signedUrl, {
				method: 'PUT',
				headers: { 'Content-Type': item.file!.type },
				body: item.file!
			});
			if (!putRes.ok) throw new Error('Artwork upload failed.');
			paths.set(target.index, target.path);
		})
	).catch(() => null);

	if (paths.size !== itemsWithFiles.length) {
		return { error: orderContent.form.errorUploadFailed };
	}

	return { orderId: data.orderId, paths };
}

export async function submitCheckout(
	formToken: string,
	company = '',
	paymentWindow?: Window | null
): Promise<CheckoutResult> {
	if (cart.items.length === 0) {
		return { ok: false, error: orderContent.cart.errorEmpty };
	}

	try {
		const itemsWithFiles = cart.items
			.map((item, index) => ({ item, index }))
			.filter(({ item }) => item.file !== null);

		let orderId: string;
		let artworkPaths = new Map<number, string>();

		if (itemsWithFiles.length > 0) {
			const uploadResult = await uploadArtwork(formToken, itemsWithFiles);
			if ('error' in uploadResult) {
				paymentWindow?.close();
				return { ok: false, error: uploadResult.error };
			}
			orderId = uploadResult.orderId;
			artworkPaths = uploadResult.paths;
		} else {
			orderId = crypto.randomUUID();
		}

		const payload = {
			orderId,
			items: cart.items.map((item, index) => ({
				projectName: item.projectName,
				rawWidth: item.rawWidth,
				rawHeight: item.rawHeight,
				rawUnit: item.rawUnit,
				optionIds: item.options.map((o) => o.id),
				marginIn: item.marginIn,
				marginColor: item.options.find((o) => o.id === COLORED_MARGIN_OPTION_ID)?.color ?? null,
				quantity: item.quantity,
				artworkPath: artworkPaths.get(index) ?? null,
				artworkFileName: item.file?.name ?? null
			})),
			company,
			formToken,
			discountCode: cart.discount?.code
		};

		const res = await fetch('/api/order', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		if (data.ok && data.invoiceUrl && data.orderId) {
			if (paymentWindow && !paymentWindow.closed) {
				paymentWindow.location.href = data.invoiceUrl;
				beginAwaitingPayment(data.orderId, paymentWindow);
			} else {
				// Popup was blocked — fall back to a full-page redirect. We lose the ability to
				// watch for payment confirmation in this tab, so clear the cart immediately here,
				// same as before this feature existed.
				cart.clear();
				window.location.href = data.invoiceUrl;
			}
			return { ok: true };
		}
		paymentWindow?.close();
		return { ok: false, error: data.error || orderContent.cart.errorGeneric };
	} catch {
		paymentWindow?.close();
		return { ok: false, error: orderContent.cart.errorGeneric };
	}
}
