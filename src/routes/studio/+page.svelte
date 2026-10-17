<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import { heroContent, studioContent } from '$lib/content';

	const { intro, tiers, menu } = studioContent;

	let hoveredTier = $state<string | null>(null);
	let canHover = $state(false);

	$effect(() => {
		const query = window.matchMedia('(hover: hover)');
		const update = () => (canHover = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});
</script>

<Hero hero={heroContent.studio} peek={heroContent.contact} />

<Section tone="surface">
	<Heading level={6} tag="p" eyebrow uppercase>{intro.eyebrow}</Heading>
	<Heading level={1} class="mt-4 max-w-4xl">{intro.heading}</Heading>
	<Heading level={3} tag="p" weight="medium" balance={false} class="mt-6 max-w-3xl">{intro.body}</Heading>
</Section>

<Section id="tiers" tone="surface">
	<Heading level={2} size="xl">{studioContent.tiersHeading}</Heading>
	<div class="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
		{#each tiers as tier (tier.id)}
			<article
				class="flex flex-col"
				onmouseenter={() => (hoveredTier = tier.id)}
				onmouseleave={() => (hoveredTier = null)}
			>
				<div class="relative aspect-4/5 w-full overflow-hidden bg-fill">
					{#if tier.video}
						<LoopVideo
							src={tier.video}
							poster={tier.image}
							label={tier.alt}
							active={canHover ? hoveredTier === tier.id : undefined}
							class="absolute inset-0 h-full w-full"
						/>
					{:else}
						<LazyImage src={tier.image} alt={tier.alt} class="absolute inset-0 h-full w-full object-cover" />
					{/if}
				</div>
				<Heading level={6} tag="p" eyebrow uppercase class="mt-6">{tier.name}</Heading>
				<Heading level={3} size="lg" class="mt-2">{tier.title}</Heading>
				<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-3">{tier.body}</Heading>
				<Heading level={5} tag="p" weight="medium" class="mt-4">{tier.pricing}</Heading>
				<div class="mt-auto pt-6">
					<ArrowLink
						href={`/contact?type=studio&tier=${tier.id}`}
						label={tier.cta}
						size="sm"
						sizeMd="md"
						class="border-2 px-6 py-3"
					/>
				</div>
			</article>
		{/each}
	</div>
</Section>

<Section tone="canvas">
	<Heading level={2} size="xl">{menu.heading}</Heading>
	<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-3 max-w-2xl">{menu.lead}</Heading>
	<div class="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
		{#each menu.items as item (item.title)}
			<article>
				<div class="relative aspect-4/3 w-full overflow-hidden bg-fill">
					<LazyImage src={item.image} alt={item.alt} class="absolute inset-0 h-full w-full object-cover" />
				</div>
				<div class="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<Heading level={3} size="md">{item.title}</Heading>
					{#if item.status}
						<Heading level={6} tag="span" tone="muted" uppercase>{item.status}</Heading>
					{/if}
				</div>
				<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-2">{item.body}</Heading>
			</article>
		{/each}
	</div>
	<ArrowLink
		href="/contact?type=studio&tier=studio-plus"
		label={tiers[0].cta}
		size="sm"
		sizeMd="md"
		class="mt-12 border-2 px-6 py-3"
	/>
</Section>
