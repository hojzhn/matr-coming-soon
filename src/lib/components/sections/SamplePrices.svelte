<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import { orderContent } from '$lib/content';
	import { calculatePriceCents, formatPrice } from '$lib/pricing/calculate';
	import { MAX_PRINT_SIDE_IN } from '$lib/pricing/config';
	import { cn } from '$lib/cn';

	let {
		selected,
		onpick
	}: {
		selected: { widthIn: number; heightIn: number } | null;
		onpick: (widthIn: number, heightIn: number) => void;
	} = $props();

	const { heading, hint, note, pickAriaTemplate, sizes } = orderContent.samples;

	const samples = sizes.map((s) => ({
		...s,
		label: `${s.widthIn} × ${s.heightIn}″`,
		priceCents: calculatePriceCents(s.widthIn, s.heightIn).priceCents
	}));

	let compareAtCents = $state<Record<string, number>>({});

	$effect(() => {
		let cancelled = false;
		Promise.all(
			samples.map(async (s) => {
				const res = await fetch('/api/order/price-preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ rawWidth: s.widthIn, rawHeight: s.heightIn, rawUnit: 'in', optionIds: [], quantity: 1 })
				});
				const data = await res.json();
				return [s.label, data.ok ? data.compareAtTotalCents : 0] as const;
			})
		)
			.then((entries) => {
				if (!cancelled) compareAtCents = Object.fromEntries(entries);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	});

	function isSelected(s: { widthIn: number; heightIn: number }) {
		return !!selected && Math.abs(selected.widthIn - s.widthIn) < 0.01 && Math.abs(selected.heightIn - s.heightIn) < 0.01;
	}
</script>

<div class="mt-8">
	<div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
		<Heading level={4} tag="h3" weight="semibold">{heading}</Heading>
		<Heading level={6} tag="p" tone="muted">{hint}</Heading>
	</div>

	<div class="mt-4 grid grid-cols-3 gap-2 md:gap-4">
		{#each samples as s (s.label)}
			{@const active = isSelected(s)}
			{@const compareAt = compareAtCents[s.label]}
			<button
				type="button"
				onclick={() => onpick(s.widthIn, s.heightIn)}
				aria-pressed={active}
				aria-label={pickAriaTemplate.replace('{size}', s.label).replace('{price}', formatPrice(s.priceCents))}
				class={cn(
					'group flex flex-col items-center gap-3 border-2 bg-fill-soft px-2 pt-4 pb-3 text-center transition-colors md:px-4 md:pt-6 md:pb-4',
					active ? 'border-ink bg-surface' : 'border-transparent hover:border-line'
				)}
			>
				<div class="flex h-24 w-full items-end justify-center md:h-36">
					<div
						aria-hidden="true"
						class={cn(
							'border-2 bg-surface transition-colors',
							active ? 'border-brand bg-brand/20' : 'border-ink group-hover:border-brand'
						)}
						style={`height:${(s.heightIn / MAX_PRINT_SIDE_IN) * 100}%;aspect-ratio:${s.widthIn}/${s.heightIn};`}
					></div>
				</div>
				<div>
					<Heading level={6} tag="p" tone="muted" weight="medium">{s.label}</Heading>
					<div class="mt-0.5 flex flex-wrap items-baseline justify-center gap-x-1.5">
						{#if compareAt && compareAt > s.priceCents}
							<Heading level={6} tag="span" tone="muted" strike>{formatPrice(compareAt).replace('.00', '')}</Heading>
						{/if}
						<Heading level={4} tag="span" size="md" sizeMd="lg" weight="bold">{formatPrice(s.priceCents).replace('.00', '')}</Heading>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<Heading level={6} tag="p" tone="muted" class="mt-2">{note}</Heading>
</div>
