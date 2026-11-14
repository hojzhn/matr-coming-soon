<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { artist, collection, work, prev, next, base } = $derived(data);
</script>

<svelte:head>
	<title>{work.title} · {artist.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#snippet plate(src: string, alt: string, caption: string)}
	<figure class="flex flex-col">
		<div class="relative aspect-square w-full overflow-hidden bg-fill">
			<LazyImage {src} {alt} loading="eager" class="absolute inset-0 h-full w-full object-contain" />
		</div>
		<figcaption class="mt-3">
			<Heading level={5} tag="span" size="sm" tone="muted" balance={false}>{caption}</Heading>
		</figcaption>
	</figure>
{/snippet}

<Section tone="surface" class="pt-32 md:pt-40">
	<a href="{base || '/'}#{collection.slug}" class="inline-flex hover:underline">
		<Heading level={6} tag="span" eyebrow uppercase balance={false}>{artist.name} / {collection.title}</Heading>
	</a>
	<Heading level={1} size="2xl" class="mt-3">{work.title}</Heading>

	<div class="mt-10 grid gap-8 md:grid-cols-2 md:gap-6">
		{#if work.photo}
			{@render plate(work.photo, `${work.title}, printed in oil`, 'Printed in oil')}
			{@render plate(work.digital, `${work.title}, digital file`, 'Digital file')}
		{:else}
			{@render plate(work.digital, `${work.title}, digital file`, 'Digital file. The printed piece has not been photographed yet.')}
		{/if}
	</div>

	<div class="mt-10 flex flex-wrap justify-between gap-4 border-t-2 border-ink pt-6">
		<a href="{base}/{prev.slug}" class="hover:underline">
			<Heading level={5} tag="span" size="sm" sizeMd="base" weight="semibold" balance={false}>← {prev.title}</Heading>
		</a>
		<ArrowLink href="{base}/{next.slug}" label={next.title} size="sm" sizeMd="base" />
	</div>
</Section>
