<script lang="ts">
	import { fade } from 'svelte/transition';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import { toolboxContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';

	const techniques = toolboxContent.techniques;

	let activeIndex = $state(0);
	const active = $derived(techniques[activeIndex]);

	function select(index: number) {
		if (index === activeIndex) return;
		activeIndex = index;
		trackEvent('technique_select', { technique: techniques[index].title });
	}
</script>

<Section tone="surface">
	<Heading level={1}>{toolboxContent.techniquesHeading}</Heading>

	<div class="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
		<div aria-live="polite">
			{#key activeIndex}
				<div in:fade={{ duration: 300 }}>
					<div class="relative aspect-4/3 w-full overflow-hidden bg-fill">
						{#if active.video}
							<LoopVideo
								src={active.video}
								poster={active.image}
								label={active.alt}
								class="absolute inset-0 h-full w-full"
							/>
						{:else}
							<LazyImage src={active.image} alt={active.alt} class="absolute inset-0 h-full w-full object-cover" />
						{/if}
					</div>
					<Heading level={4} size="md" class="mt-6">{active.title}</Heading>
					<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-2">{active.body}</Heading>
				</div>
			{/key}
		</div>

		<div class="grid grid-cols-2 content-start gap-x-4 gap-y-6">
			{#each techniques as technique, i (technique.title)}
				{@const selected = i === activeIndex}
				<button
					type="button"
					onclick={() => select(i)}
					aria-pressed={selected}
					class={cn(
						'flex flex-col items-start gap-2 text-left transition-opacity duration-300',
						selected ? 'opacity-100' : 'opacity-40 hover:opacity-100'
					)}
				>
					<div class="relative aspect-4/3 w-full overflow-hidden bg-fill">
						<LazyImage src={technique.image} alt="" class="absolute inset-0 h-full w-full object-cover" />
					</div>
					<Heading level={4} tag="span" weight="medium" underline={selected}>{technique.title}</Heading>
				</button>
			{/each}
		</div>
	</div>
</Section>
