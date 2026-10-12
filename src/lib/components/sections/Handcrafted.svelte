<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { handcraftedContent } from '$lib/content';

	const craftedSrc = '/images/strengths/crafted.webp';
</script>

<Section id="handcrafted" tone="surface" width="full">
	<Heading level={1} size="hero" leading="none" tracking="tighter" balance={false}>{handcraftedContent.heading}</Heading>
	<div class="flex flex-col items-start lg:items-end gap-8 mt-16 lg:flex-row ">
		<div class="max-w-[900px]">
			<Heading level={3} tag="p" weight="medium" balance={false}>
				{handcraftedContent.body}
			</Heading>
		
		</div>
	</div>
</Section>
