<script lang="ts">
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import { announcementState } from '$lib/components/layout/announcement-state.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import CommissionForm from '$lib/components/sections/CommissionForm.svelte';
	import Contact from '$lib/components/sections/Contact.svelte';
	import { toolboxContent } from '$lib/content';
	import type { Technique } from '$lib/content/types';
	import { cn } from '$lib/cn';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	announcementState.dismissed = data.announcementDismissed;

	const { combining, materials } = toolboxContent;
</script>

{#snippet block(item: Technique, flip: boolean, label?: string)}
	<article class="grid items-center gap-6 md:grid-cols-2 md:gap-12">
		<div class={cn('relative aspect-4/3 w-full overflow-hidden bg-fill', flip && 'md:order-2')}>
			{#if item.video}
				<LoopVideo
					src={item.video}
					poster={item.image}
					label={item.alt}
					class="absolute inset-0 h-full w-full"
				/>
			{:else}
				<LazyImage
					src={item.image}
					alt={item.alt}
					class="absolute inset-0 h-full w-full object-cover"
				/>
			{/if}
		</div>
		<div class="flex flex-col gap-4">
			{#if label}
				<Heading level={6} tag="p" tone="muted" weight="medium">{label}</Heading>
			{/if}
			<Heading level={3} size="lg" sizeMd="xl" weight="bold">{item.title}</Heading>
			<Heading level={3} tag="p" weight="medium" tone="muted" balance={false}>
				{item.body}
			</Heading>
		</div>
	</article>
{/snippet}

<AnnouncementBar />
<Header formToken={data.formToken} />
<Toast />

<main>
	<Section id="top" tone="ink" class="pt-32 pb-16 md:pt-40 md:pb-24">
		<div class="flex max-w-4xl flex-col items-start gap-6">
			<Heading level={5} tag="p" tone="brand" uppercase>{toolboxContent.eyebrow}</Heading>
			<Heading level={1} tone="surface">{toolboxContent.heading}</Heading>
			<Heading level={3} tag="p" weight="medium" tone="dim" balance={false}>
				{toolboxContent.lead}
			</Heading>
			<ArrowLink
				href={toolboxContent.ctaHref}
				label={toolboxContent.cta}
				variant="button"
				class="mt-2 border-brand bg-brand text-ink"
			/>
		</div>
	</Section>

	<Section tone="surface" class="py-16 md:py-24">
		<Heading level={2} tone="muted" class="mb-12 md:mb-16">{toolboxContent.techniquesHeading}</Heading>
		<div class="flex flex-col gap-16 md:gap-24">
			{#each toolboxContent.techniques as technique, i (technique.title)}
				{@render block(technique, i % 2 === 1, String(i + 1).padStart(2, '0'))}
			{/each}
		</div>
	</Section>

	<Section tone="ink" class="py-16 md:py-24">
		<div class="grid items-center gap-8 md:grid-cols-2 md:gap-16">
			<div class="relative mx-auto aspect-3/4 w-full max-w-md overflow-hidden">
				<LoopVideo
					src={combining.video}
					poster={combining.image}
					label={combining.alt}
					class="absolute inset-0 h-full w-full"
				/>
			</div>
			<div class="flex flex-col items-start gap-6">
				<Heading level={5} tag="p" tone="brand" uppercase>{combining.eyebrow}</Heading>
				<Heading level={1} tag="h2" tone="surface">{combining.heading}</Heading>
				<Heading level={3} tag="p" weight="medium" tone="dim" balance={false}>
					{combining.body}
				</Heading>
			</div>
		</div>
	</Section>

	<Section tone="surface" class="py-16 md:py-24">
		<Heading level={2} tone="muted" class="mb-12 md:mb-16">{materials.heading}</Heading>
		{@render block(materials.feature, false)}
		<div class="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
			{#each materials.cards as card (card.title)}
				<article class="flex flex-col gap-4 border border-line p-6 md:p-8">
					<Heading level={3} size="lg" weight="bold">{card.title}</Heading>
					<Heading level={3} tag="p" weight="medium" tone="muted" balance={false}>
						{card.body}
					</Heading>
				</article>
			{/each}
		</div>
	</Section>

	<CommissionForm formToken={data.formToken} />
	<Contact formToken={data.formToken} />
</main>

<Footer formToken={data.formToken} />
