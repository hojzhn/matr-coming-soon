import { orderContent } from '$lib/content';
import { cart } from './cart.svelte';

export type CheckoutResult = { ok: true } | { ok: false; error: string };

export async function submitCheckout(formToken: string, company = ''): Promise<CheckoutResult> {
	if (cart.items.length === 0) {
		return { ok: false, error: orderContent.cart.errorEmpty };
	}

	try {
		const res = await fetch('/api/order', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
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
				formToken
			})
		});
		const data = await res.json();
		if (data.ok && data.invoiceUrl) {
			cart.clear();
			window.location.href = data.invoiceUrl;
			return { ok: true };
		}
		return { ok: false, error: data.error || orderContent.cart.errorGeneric };
	} catch {
		return { ok: false, error: orderContent.cart.errorGeneric };
	}
}
