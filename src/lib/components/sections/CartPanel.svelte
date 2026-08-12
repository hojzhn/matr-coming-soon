<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { orderContent } from '$lib/content';
	import { cart } from '$lib/cart/cart.svelte';
	import { MAX_ITEM_QUANTITY } from '$lib/pricing/config';
	import { formatPrice } from '$lib/pricing/calculate';

	let { formToken }: { formToken: string } = $props();

	let company = $state('');
	let loading = $state(false);
	let error = $state('');

	async function checkout() {
		error = '';

		if (cart.items.length === 0) {
			error = orderContent.cart.errorEmpty;
			return;
		}

		loading = true;
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
						finishId: item.finishId,
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
				return;
			}
			error = data.error || orderContent.cart.errorGeneric;
		} catch {
			error = orderContent.cart.errorGeneric;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mt-16 border-t border-line pt-10">
	<Heading level={3} tag="p" size="lg" class="mb-6">{orderContent.cart.heading}</Heading>

	{#if cart.items.length === 0}
		<div class="border border-dashed border-line px-6 py-10 text-center">
			<Heading level={4} tag="p" size="sm" weight="medium">{orderContent.cart.emptyLabel}</Heading>
			<Heading level={5} tag="p" size="xs" tone="muted" class="mt-1">{orderContent.cart.emptyHint}</Heading>
		</div>
	{:else}
		<div class="flex flex-col divide-y divide-line border-y border-line">
			{#each cart.items as item (item.id)}
				<div class="flex items-center gap-4 py-4">
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
						<Heading level={4} tag="p" size="sm" weight="medium" class="truncate">
							{item.projectName || 'Untitled print'}
						</Heading>
						<Heading level={5} tag="p" size="xs" tone="muted" class="mt-0.5">
							{item.widthIn} x {item.heightIn} in · {item.finishLabel}
						</Heading>
					</div>

					<label class="flex flex-col items-start gap-1">
						<span class="sr-only">{orderContent.cart.quantityAriaLabel}</span>
						<input
							type="number"
							min="1"
							max={MAX_ITEM_QUANTITY}
							inputmode="numeric"
							value={item.quantity}
							oninput={(e) => cart.updateQuantity(item.id, Number(e.currentTarget.value))}
							class="w-16 border-b-2 border-ink bg-transparent px-0 py-1 text-center text-sm font-medium text-ink outline-none transition-colors [appearance:textfield] focus:border-brand [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</label>

					<Heading level={4} tag="p" size="sm" weight="medium" class="w-24 shrink-0 text-right">
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
			{/each}
		</div>

		<div class="mt-6 flex items-center justify-between">
			<Heading level={4} tag="span" size="sm" tone="muted">{orderContent.cart.subtotalLabel}</Heading>
			<Heading level={3} tag="span" size="lg">{formatPrice(cart.subtotalCents)}</Heading>
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
			<Heading level={4} tag="p" size="xs" class="mt-4 text-danger">{error}</Heading>
		{/if}

		<ArrowLink
			type="button"
			variant="button"
			label={loading ? orderContent.cart.checkoutLoadingLabel : orderContent.cart.checkoutLabel}
			{loading}
			disabled={loading || cart.items.length === 0}
			onclick={checkout}
			class="mt-6 w-full"
		/>
	{/if}
</div>
