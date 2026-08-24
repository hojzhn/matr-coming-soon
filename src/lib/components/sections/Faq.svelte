<script lang="ts">
	import { slide } from 'svelte/transition';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { faqContent } from '$lib/content';

	let openIndex = $state<number | null>(0);

	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}
</script>

<Section tone="surface">
	<div class="flex flex-col divide-y divide-line border-t border-line">
		{#each faqContent.items as item, i (item.question)}
			<div>
				<button
					type="button"
					class="flex w-full items-center justify-between gap-6 py-6 text-left"
					aria-expanded={openIndex === i}
					onclick={() => toggle(i)}
				>
					<Heading level={3} tag="p"  weight="medium" balance={false}>
						{item.question}
					</Heading>
					<Icon
						name="chevron-down"
						class="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 {openIndex === i
							? 'rotate-180'
							: ''}"
					/>
				</button>
				{#if openIndex === i}
					<div transition:slide={{ duration: 250 }}>
							<Heading level={4} tag="p" weight="medium" size="md" tone="muted" class="max-w-3xl pb-6">
							{item.answer}
						</Heading>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</Section>
