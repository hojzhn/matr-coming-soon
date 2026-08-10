<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { heroContent, brandsContent } from '$lib/content';
</script>

<Section id="top" tone="ink" fullHeight contained={false} class="justify-between py-0">
	<div class="flex flex-1 flex-col items-center justify-center px-container text-center">
		<Heading level={1} size="hero" tone="surface" align="center">
			{heroContent.headline}
		</Heading>
		<Heading level={2} tag="p" size="sm" sizeMd="md" weight="medium" tone="muted" align="center" class="mt-6 max-w-xl">
			{heroContent.subheadline}
		</Heading>
	</div>

	<div class="px-container pb-12">
		<Heading level={3} tag="p" eyebrow uppercase align="center">
			{heroContent.logosLabel}
		</Heading>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
			{#each brandsContent.items as brand (brand.src)}
				<img
					src={brand.src}
					alt={brand.name}
					class="h-6 w-auto shrink-0 opacity-60 brightness-0 invert transition-opacity hover:opacity-100"
				/>
			{/each}
		</div>
	</div>
</Section>
