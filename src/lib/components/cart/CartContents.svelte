<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { orderContent } from '$lib/content';
	import { cart } from '$lib/cart/cart.svelte';
	import { submitCheckout } from '$lib/cart/checkout';
	import { checkoutStatus } from '$lib/cart/checkout-status.svelte';
	import { trackEvent } from '$lib/analytics/track';
	import { MAX_ITEM_QUANTITY, OUTPAINT_OPTION_ID } from '$lib/pricing/config';
	import { formatPrice, formatMarginStep } from '$lib/pricing/calculate';

	let { formToken }: { formToken: string } = $props();

	let company = $state('');
	let loading = $state(false);
	let error = $state('');

	let discountCode = $state('');
	let discountLoading = $state(false);
	let discountError = $state('');

	async function applyDiscount() {
		const code = discountCode.trim();
		if (!code) return;
		discountError = '';
		discountLoading = true;
		try {
			const res = await fetch('/api/discount', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, subtotalCents: cart.subtotalCents, formToken })
			});
			const data = await res.json();
			if (data.ok) {
				cart.applyDiscount({ code: data.code, title: data.title, discountCents: data.discountCents });
				trackEvent('discount_applied', { code: data.code });
				discountCode = '';
			} else {
				discountError = data.error || orderContent.cart.errorGeneric;
			}
		} catch {
			discountError = orderContent.cart.errorGeneric;
		}
		discountLoading = false;
	}

	function removeDiscount() {
		cart.removeDiscount();
		discountError = '';
	}

	async function checkout() {
		error = '';
		loading = true;
		const paymentWindow = window.open('about:blank', '_blank');
		const result = await submitCheckout(formToken, company, paymentWindow);
		if (!result.ok) error = result.error;
		loading = false;
	}
</script>

<div class="flex h-full flex-col">
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if cart.items.length === 0}
			<div class="border border-dashed border-line px-6 py-10 text-center">
				<Heading level={5} tag="p" weight="medium">{orderContent.cart.emptyLabel}</Heading>
				<Heading level={6} tag="p" tone="muted" class="mt-1">{orderContent.cart.emptyHint}</Heading>
			</div>
		{:else}
			<div class="flex flex-col divide-y divide-line">
				{#each cart.items as item (item.id)}
					<div class="flex gap-3 py-4">
						<div class="h-16 w-16 shrink-0 overflow-hidden bg-fill-soft/60">
							{#if item.previewUrl}
								<img src={item.previewUrl} alt="" class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<Icon name="file" class="h-6 w-6 text-ink-faint" />
								</div>
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<Heading level={5} tag="p" weight="medium" class="truncate">
								{item.projectName || orderContent.form.untitledLabel}
							</Heading>
							<Heading level={6} tag="p" tone="muted" class="mt-0.5">
								{item.widthIn} x {item.heightIn} in · {formatMarginStep(item.marginIn)}″ margin
							</Heading>
							{#each item.options.filter((opt) => opt.id !== OUTPAINT_OPTION_ID) as opt (opt.id)}
								<Heading level={6} tag="p" tone="muted" class="ml-3 flex items-center gap-1.5">
									- {opt.label} ({formatPrice(opt.priceDeltaCents)})
									{#if opt.color}
										<span
											class="h-2.5 w-2.5 shrink-0 rounded-full border border-line"
											style={`background-color:${opt.color}`}
										></span>
									{/if}
								</Heading>
							{/each}

							<div class="mt-3 flex items-center justify-between gap-2">
								<label class="flex items-center gap-1">
									<span class="sr-only">{orderContent.cart.quantityAriaLabel}</span>
									<input
										type="number"
										min="1"
										max={MAX_ITEM_QUANTITY}
										inputmode="numeric"
										value={item.quantity}
										oninput={(e) => cart.updateQuantity(item.id, Number(e.currentTarget.value))}
										class="w-12 border-b-2 border-ink bg-transparent px-0 py-1 text-center text-sm font-medium text-ink outline-none transition-colors [appearance:textfield] focus:border-brand [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
								</label>

								<Heading level={5} tag="span" weight="medium">
									{formatPrice(item.unitPriceCents * item.quantity)}
								</Heading>

								<button
									type="button"
									onclick={() => cart.remove(item.id)}
									aria-label={orderContent.cart.removeLabel}
									class="shrink-0 text-ink-faint transition-colors hover:text-ink"
								>
									<Icon name="close" class="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if cart.items.length > 0}
		<div class="mt-4 shrink-0 border-t border-line pt-4">
			<div class="flex items-center justify-between">
				<Heading level={5} tag="span" tone="muted">{orderContent.cart.subtotalLabel}</Heading>
				<Heading level={5} tag="span">{formatPrice(cart.subtotalCents)}</Heading>
			</div>

			{#if cart.discount}
				<div class="mt-1 flex items-center justify-between gap-2">
					<Heading level={6} tag="span" tone="muted">
						{orderContent.cart.discountAppliedPrefix}
						{cart.discount.code}
					</Heading>
					<div class="flex items-center gap-2">
						<Heading level={6} tag="span">-{formatPrice(cart.discountCents)}</Heading>
						<button
							type="button"
							onclick={removeDiscount}
							aria-label={orderContent.cart.discountRemoveLabel}
							class="text-ink-faint transition-colors hover:text-ink"
						>
							<Icon name="close" class="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			{:else}
				<div class="mt-3 flex items-center gap-2">
					<label class="flex-1">
						<span class="sr-only">{orderContent.cart.discountLabel}</span>
						<input
							type="text"
							bind:value={discountCode}
							placeholder={orderContent.cart.discountPlaceholder}
							autocomplete="off"
							class="w-full border-b-2 border-ink bg-transparent px-0 py-1 text-sm text-ink outline-none transition-colors focus:border-brand"
						/>
					</label>
					<ArrowLink
						type="button"
						variant="button"
						arrow={false}
						size="xs"
						label={discountLoading ? orderContent.cart.discountApplyingLabel : orderContent.cart.discountApplyLabel}
						loading={discountLoading}
						disabled={discountLoading || !discountCode.trim()}
						onclick={applyDiscount}
						class="shrink-0 px-4 py-2"
					/>
				</div>
				{#if discountError}
					<Heading level={6} tag="p" class="mt-1 text-danger">{discountError}</Heading>
				{/if}
			{/if}

			<div class="mt-3 flex items-center justify-between border-t border-line pt-3">
				<Heading level={5} tag="span" tone="muted">{orderContent.cart.totalLabel}</Heading>
				<Heading level={2} tag="span">{formatPrice(cart.totalCents)}</Heading>
			</div>

			<input
				type="text"
				name="company"
				bind:value={company}
				tabindex="-1"
				autocomplete="off"
				class="hidden"
				aria-hidden="true"
			/>

			{#if error}
				<Heading level={6} tag="p" class="mt-4 text-danger">{error}</Heading>
			{/if}

			<ArrowLink
				type="button"
				variant="button"
				label={loading ? orderContent.cart.checkoutLoadingLabel : orderContent.cart.checkoutLabel}
				{loading}
				disabled={loading || cart.items.length === 0 || checkoutStatus.awaitingPayment}
				onclick={checkout}
				class="mt-4 w-full"
			/>

			{#if checkoutStatus.awaitingPayment}
				<Heading level={6} tag="p" tone="muted" class="mt-2">
					{orderContent.cart.awaitingPaymentLabel}
				</Heading>
			{/if}
		</div>
	{/if}
</div>
