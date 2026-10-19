<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import { heroContent, studioContent } from '$lib/content';
	import type { StudioTile } from '$lib/content/types';
	import { cn } from '$lib/cn';

	const { intro, beyond, together, pro } = studioContent;

	let hovered = $state<string | null>(null);
	let canHover = $state(false);

	$effect(() => {
		const query = window.matchMedia('(hover: hover)');
		const update = () => (canHover = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	const contactHref = (tier: string) => `/contact?type=studio&tier=${tier}`;
</script>

{#snippet tile(item: StudioTile, aspect: string)}
	<figure
		class="flex flex-col"
		onmouseenter={() => (hovered = item.caption)}
		onmouseleave={() => (hovered = null)}
	>
		<div class={cn('relative w-full overflow-hidden bg-fill', aspect)}>
			{#if item.video}
				<LoopVideo
					src={item.video}
					poster={item.image}
					label={item.alt}
					active={canHover ? hovered === item.caption : undefined}
					class="absolute inset-0 h-full w-full"
				/>
			{:else}
				<LazyImage src={item.image} alt={item.alt} class="absolute inset-0 h-full w-full object-cover" />
			{/if}
		</div>
		<figcaption class="mt-3">
			<Heading level={4} tag="span" size="sm" sizeMd="base" weight="semibold" balance={false}>{item.caption}</Heading>
		</figcaption>
	</figure>
{/snippet}

<Hero hero={heroContent.studio} peek={heroContent.contact} />

<Section tone="surface">
	<Heading level={6} tag="p" eyebrow uppercase>{intro.eyebrow}</Heading>
	<Heading level={1} class="mt-4 max-w-4xl">{intro.heading}</Heading>
	<Heading level={3} tag="p" weight="medium" balance={false} class="mt-6 max-w-3xl">{intro.body}</Heading>
</Section>

<Section id={beyond.id} tone="surface" class="scroll-mt-28 border-t-2 border-ink">
	<Heading level={2} size="xl">{beyond.heading}</Heading>
	<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-3 max-w-2xl">{beyond.lead}</Heading>
	<ArrowLink href={contactHref(beyond.tier)} label={beyond.cta} size="sm" sizeMd="md" class="mt-6 border-2 px-6 py-3" />
	<div class="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
		{#each beyond.items as item (item.caption)}
			{@render tile(item, 'aspect-4/5')}
		{/each}
	</div>
	<ArrowLink href={contactHref(beyond.tier)} label={beyond.cta} size="sm" sizeMd="md" class="mt-10" />
</Section>

<Section id={together.id} tone="surface" class="border-t-2 border-ink">
	<Heading level={2} size="xl">{together.heading}</Heading>
	<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-3 max-w-2xl">{together.lead}</Heading>
	<div class="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
		{#each together.items as item (item.caption)}
			{@render tile(item, 'aspect-4/3')}
		{/each}
	</div>
	<ArrowLink href={contactHref(together.tier)} label={together.cta} size="sm" sizeMd="md" class="mt-10 border-2 px-6 py-3" />
</Section>

<Section id={pro.id} tone="surface" class="border-t-2 border-ink">
	<div class="border-2 border-ink p-6 md:p-12">
		<Heading level={6} tag="p" eyebrow uppercase>{pro.eyebrow}</Heading>
		<Heading level={2} size="xl" class="mt-3 max-w-3xl">{pro.heading}</Heading>
		<Heading level={4} tag="p" weight="medium" balance={false} class="mt-4 max-w-3xl">{pro.body}</Heading>
		<ArrowLink href={contactHref(pro.tier)} label={pro.cta} size="sm" sizeMd="md" class="mt-8 border-2 px-6 py-3" />
	</div>
</Section>
