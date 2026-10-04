<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { collaborateContent } from '$lib/content';
</script>

<Section id="collaborate" tone="canvas" class="py-16 md:py-24">
	<div class="grid items-center gap-8 md:grid-cols-2 md:gap-16">
		<a href={collaborateContent.href} tabindex="-1" aria-hidden="true" class="relative block aspect-video w-full overflow-hidden">
			<LazyImage
				src={collaborateContent.image}
				alt=""
				class="absolute inset-0 h-full w-full object-cover"
			/>
		</a>
		<div class="flex flex-col items-start gap-6">
			<Heading level={1} tag="h2">{collaborateContent.heading}</Heading>
			<Heading level={3} tag="p" weight="medium" tone="muted" balance={false}>
				{collaborateContent.body}
			</Heading>
			<ArrowLink href={collaborateContent.href} label={collaborateContent.cta} variant="button" />
		</div>
	</div>
</Section>
