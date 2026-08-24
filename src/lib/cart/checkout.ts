import { orderContent } from '$lib/content';
import { cart } from './cart.svelte';

export type CheckoutResult = { ok: true } | { ok: false; error: string };

export async function submitCheckout(formToken: string, company = ''): Promise<CheckoutResult> {
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
