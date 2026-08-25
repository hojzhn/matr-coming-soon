import { cart } from './cart.svelte';
import { toast } from '$lib/toast/toast.svelte';
import { orderContent } from '$lib/content';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_MS = 20 * 60 * 1000;
const CLOSED_TAB_GRACE_MS = 15000;

export const checkoutStatus = $state<{ awaitingPayment: boolean }>({ awaitingPayment: false });

let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollDeadline = 0;
let tabClosedAt: number | null = null;

export function beginAwaitingPayment(orderId: string, paymentWindow?: Window | null): void {
	stopPolling();
	checkoutStatus.awaitingPayment = true;
	pollDeadline = Date.now() + MAX_POLL_MS;
	tabClosedAt = null;

	pollTimer = setInterval(async () => {
		if (Date.now() > pollDeadline) {
			stopPolling();
			return;
		}

		if (paymentWindow?.closed && tabClosedAt === null) {
			tabClosedAt = Date.now();
		}

		try {
			const res = await fetch(`/api/order/${orderId}/status`);
			if (res.ok) {
				const data = await res.json();
				if (data.status === 'paid') {
					cart.clear();
					toast.show(orderContent.cart.paymentConfirmedToast);
					stopPolling();
					return;
				}
			}
		} catch {
			// Transient network error — retry on the next tick.
		}

		// The payment tab is closed and not yet confirmed paid — give the webhook a short
		// grace window (in case it's just landing late), then stop waiting.
		if (tabClosedAt !== null && Date.now() - tabClosedAt > CLOSED_TAB_GRACE_MS) {
			stopPolling();
		}
	}, POLL_INTERVAL_MS);
}

function stopPolling(): void {
	if (pollTimer) clearInterval(pollTimer);
	pollTimer = null;
	tabClosedAt = null;
	checkoutStatus.awaitingPayment = false;
}
