import { orderContent } from '$lib/content';
import { cart } from './cart.svelte';
import { beginAwaitingPayment } from './checkout-status.svelte';

export type CheckoutResult = { ok: true } | { ok: false; error: string };

export async function submitCheckout(
	formToken: string,
	company = '',
	paymentWindow?: Window | null
): Promise<CheckoutResult> {
	if (cart.items.length === 0) {
		return { ok: false, error: orderContent.cart.errorEmpty };
	}

	try {
		const payload = {
			items: cart.items.map((item) => ({
				projectName: item.projectName,
				rawWidth: item.rawWidth,
				rawHeight: item.rawHeight,
				rawUnit: item.rawUnit,
				optionIds: item.options.map((o) => o.id),
				marginIn: item.marginIn,
				quantity: item.quantity
			})),
			company,
			formToken,
			discountCode: cart.discount?.code
		};

		const body = new FormData();
		body.append('payload', JSON.stringify(payload));
		cart.items.forEach((item, i) => {
			if (item.file) body.append(`file_${i}`, item.file, item.file.name);
		});

		const res = await fetch('/api/order', { method: 'POST', body });
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
