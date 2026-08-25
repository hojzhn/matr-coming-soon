<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { heroContent, brandsContent } from '$lib/content';

	const carouselImages = Array.from({ length: 10 }, (_, i) => `/images/hero/carousel_${i + 1}.webp`);

	let activeIndex = $state(0);
	let readyCount = $state(0);

	$effect(() => {
		carouselImages.forEach((src) => {
			const img = new Image();
			img.onload = img.onerror = () => (readyCount += 1);
			img.src = src;
		});
	});

	$effect(() => {
		if (readyCount < carouselImages.length) return;
		const id = setInterval(() => {
			activeIndex = (activeIndex + 1) % carouselImages.length;
		}, 750);
		return () => clearInterval(id);
	});
</script>

<Section id="top" tone="ink" fullHeight contained={false} class="justify-between py-0">
	
	
		<div class="relative mb-20 w-full flex-1 min-h-0">
			<img
				src={carouselImages[activeIndex]}
				alt=""
				loading="eager"
				decoding="async"
				class="absolute inset-0 h-full w-full object-contain"
			/>
		</div>

	<div class="mb-12 shrink-0">
		<Heading level={5} tag="h1" tone="muted"  align="center">
			{heroContent.logosLabel}
		</Heading>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
			{#each brandsContent.items as brand (brand.src)}
				<LazyImage
					src={brand.src}
					alt={brand.name}
					class="h-4 md:h-6 w-auto shrink-0 opacity-60 brightness-0 invert transition-opacity hover:opacity-100"
				/>
			{/each}
		</div>
	</div>
</Section>
