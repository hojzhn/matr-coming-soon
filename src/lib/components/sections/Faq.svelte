<script lang="ts">
	import { slide } from 'svelte/transition';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { faqContent } from '$lib/content';
	import { cn } from '$lib/cn';

	let openIndex = $state<number | null>(0);

	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}
</script>

<Section tone="surface" contained={false} class="pb-0">
	<div class="grid border-t-2 border-ink md:grid-cols-12">
		<div class="border-b-2 border-ink px-container py-6 md:col-span-5 md:border-r-2 md:border-b-0 md:py-8">
			<div class="md:sticky md:top-24">
				<Heading level={2} size="2xl" balance={false}>{faqContent.heading}</Heading>
			</div>
		</div>

		<div class="flex flex-col md:col-span-7">
			{#each faqContent.items as item, i (item.question)}
				{@const open = openIndex === i}
				<div class="border-b-2 border-ink last:border-b-0">
					<button
						type="button"
						class="flex w-full items-center justify-between gap-6 px-container py-5 text-left md:px-8"
						aria-expanded={open}
						onclick={() => toggle(i)}
					>
						<Heading level={3} tag="p" weight="medium" balance={false}>
							{item.question}
						</Heading>
						<Icon
							name="chevron-down"
							class={cn('h-5 w-5 shrink-0 text-ink transition-transform duration-300', open && 'rotate-180')}
						/>
					</button>
					{#if open}
						<div transition:slide={{ duration: 250 }}>
							<Heading level={4} tag="p" weight="medium" tone="muted" class="max-w-3xl px-container pb-6 md:px-8">
								{item.answer}
							</Heading>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</Section>
