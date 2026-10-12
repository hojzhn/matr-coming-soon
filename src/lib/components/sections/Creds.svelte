<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { brandsContent } from '$lib/content';
</script>

<Section tone="surface" class="py-24 md:py-40">
	<div class="grid grid-cols-4 items-center justify-items-center gap-x-6 gap-y-6 md:flex md:flex-wrap md:justify-center md:gap-x-16 md:gap-y-8">
		{#each brandsContent.items as brand (brand.src)}
			<div class="flex h-4 min-w-0 items-center justify-center md:h-6">
				<LazyImage
					src={brand.src}
					alt={brand.name}
					class="h-full w-auto max-w-full shrink-0 object-contain object-center opacity-50 brightness-0 transition-opacity hover:opacity-100"
				/>
			</div>
		{/each}
	</div>
</Section>
