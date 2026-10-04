<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import PanCarousel from '$lib/components/ui/PanCarousel.svelte';
	import KineticText from '$lib/components/ui/KineticText.svelte';
	import { heroContent, brandsContent, doorsContent, carouselContent } from '$lib/content';
	import { cn } from '$lib/cn';
</script>

<Section id="top" tone="ink" contained={false} class="pt-28 pb-12 md:pt-32">
	<Container>
		<Heading
			level={2}
			tag="p"
			size="xl"
			sizeMd="display"
			tone="faint"
			weight="medium"
			tracking="wide"
			trackingMd="widest"
			uppercase
			align="center"
			class="md:-mr-[1em] md:whitespace-nowrap"
		>
			<KineticText text={heroContent.tagline} peakColor="var(--color-brand)" />
		</Heading>

		<div class="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
			{#each doorsContent.items as door (door.href)}
				<article
					class={cn(
						'flex items-start gap-4 border p-4 md:items-center md:gap-6 md:p-5',
						door.primary ? 'border-brand' : 'border-surface/25'
					)}
				>
					<a href={door.href} tabindex="-1" aria-hidden="true" class="shrink-0">
						<LazyImage
							src={door.image}
							alt=""
							loading="eager"
							class="h-20 w-20 object-cover md:h-36 md:w-36"
						/>
					</a>
					<div class="flex min-w-0 flex-col items-start gap-2">
						<Heading level={2} size="md" sizeMd="lg" tone="surface">{door.title}</Heading>
						<Heading level={4} tag="p" size="sm" sizeMd="base" weight="medium" tone="dim">
							{door.text}
						</Heading>
						<ArrowLink
							href={door.href}
							label={door.cta}
							variant="button"
							fill={door.primary ? 'ink' : 'surface'}
							class={cn('mt-2 px-4 py-2', door.primary && 'border-brand bg-brand text-ink')}
						/>
					</div>
				</article>
			{/each}
		</div>
	</Container>

	<PanCarousel items={carouselContent.items} label={carouselContent.label} class="mt-10 md:mt-12" />

	<Container class="mt-12">
		<Heading level={3} tag="h1" size="md" sizeMd="lg" weight="medium" tone="dim" align="center">
			{heroContent.logosLabel}
		</Heading>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
			{#each brandsContent.items as brand (brand.src)}
				<LazyImage
					src={brand.src}
					alt={brand.name}
					class="h-4 w-auto shrink-0 opacity-60 brightness-0 invert transition-opacity hover:opacity-100 md:h-6"
				/>
			{/each}
		</div>
	</Container>
</Section>
