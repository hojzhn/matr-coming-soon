<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Techniques from '$lib/components/sections/Techniques.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import { heroContent, toolboxContent } from '$lib/content';
	import type { Technique } from '$lib/content/types';
	import { cn } from '$lib/cn';

	const { combining, materials } = toolboxContent;
</script>

{#snippet media(item: { video?: string; image: string; alt: string }, aspect: string)}
	<div class={cn('relative w-full overflow-hidden bg-fill', aspect)}>
		{#if item.video}
			<LoopVideo src={item.video} poster={item.image} label={item.alt} class="absolute inset-0 h-full w-full" />
		{:else}
			<LazyImage src={item.image} alt={item.alt} class="absolute inset-0 h-full w-full object-cover" />
		{/if}
	</div>
{/snippet}

{#snippet block(item: Technique, flip: boolean)}
	<article class="grid items-center gap-6 md:grid-cols-2 md:gap-12">
		<div class={cn(flip && 'md:order-2')}>
			{@render media(item, 'aspect-4/3')}
		</div>
		<div>
			<Heading level={4} size="md">{item.title}</Heading>
			<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-2">{item.body}</Heading>
		</div>
	</article>
{/snippet}

<Hero hero={heroContent.studioPlus} peek={heroContent.contact} />

<Section tone="surface">
	<Heading level={1}>{toolboxContent.heading}</Heading>
	<Heading level={3} tag="p" weight="medium" balance={false} class="mt-4 max-w-3xl">
		{toolboxContent.lead}
	</Heading>
	<ArrowLink
		href={toolboxContent.ctaHref}
		label={toolboxContent.cta}
		size="sm"
		sizeMd="md"
		arrow={false}
		class="mt-4 lg:mt-12 border-2 px-6 py-3"
	/>
</Section>

<Techniques />

<Section tone="surface">
	<div class="grid items-center gap-8 md:grid-cols-2 md:gap-16">
		<div class="mx-auto w-full max-w-md">
			{@render media(combining, 'aspect-3/4')}
		</div>
		<div>
			<Heading level={1}>{combining.heading}</Heading>
			<Heading level={3} tag="p" weight="medium" balance={false} class="mt-4">
				{combining.body}
			</Heading>
		</div>
	</div>
</Section>

<Section tone="surface">
	<Heading level={1}>{materials.heading}</Heading>
	<div class="mt-12">
		{@render block(materials.feature, false)}
	</div>
	<div class="mt-12 grid gap-12 sm:grid-cols-2">
		{#each materials.cards as card (card.title)}
			<div>
				<Heading level={4} size="md">{card.title}</Heading>
				<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-2">{card.body}</Heading>
			</div>
		{/each}
	</div>
</Section>
