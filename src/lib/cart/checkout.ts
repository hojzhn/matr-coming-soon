import { orderContent } from '$lib/content';
import { COLORED_MARGIN_OPTION_ID } from '$lib/pricing/config';
import { trackEvent } from '$lib/analytics/track';
import { cart, type CartItem } from './cart.svelte';
import { beginAwaitingPayment } from './checkout-status.svelte';
import { ArtworkUploadError, getArtworkUpload, startArtworkUpload } from './artwork-upload.svelte';

export type CheckoutResult = { ok: true } | { ok: false; error: string };

export function pendingUploadProgress(): number | null {
	const pending = cart.items
		.filter((item) => !item.artworkPath)
		.map((item) => getArtworkUpload(item.file))
		.filter((upload) => upload?.status === 'uploading');
	if (pending.length === 0) return null;
	return pending.reduce((sum, upload) => sum + upload!.progress, 0) / pending.length;
}

async function resolveArtworkPath(formToken: string, item: CartItem): Promise<string | null> {
	if (item.artworkPath) return item.artworkPath;
	if (!item.file) return null;
	const path = await startArtworkUpload(formToken, item.file).promise;
	cart.setArtworkPath(item.id, path);
	return path;
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
		let artworkPaths: (string | null)[];
		try {
			artworkPaths = await Promise.all(cart.items.map((item) => resolveArtworkPath(formToken, item)));
		} catch (err) {
			paymentWindow?.close();
			return {
				ok: false,
				error: err instanceof ArtworkUploadError ? err.message : orderContent.form.errorUploadFailed
			};
		}

		const payload = {
			items: cart.items.map((item, index) => ({
				projectName: item.projectName,
				rawWidth: item.rawWidth,
				rawHeight: item.rawHeight,
				rawUnit: item.rawUnit,
				optionIds: item.options.map((o) => o.id),
				marginColor: item.options.find((o) => o.id === COLORED_MARGIN_OPTION_ID)?.color ?? null,
				quantity: item.quantity,
				artworkPath: artworkPaths[index],
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
			trackEvent('checkout_started', {
				itemCount: cart.items.length,
				totalCents: cart.totalCents,
				discountCode: cart.discount?.code ?? null
			});

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
