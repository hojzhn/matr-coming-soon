<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { cn } from '$lib/cn';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const artist = $derived(data.artist);
</script>

<svelte:head>
	<title>{artist.name} · Matr Studio Plus</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Section tone="surface" class="pt-8 md:pt-12">
	<Heading level={1} size="hero">{artist.name}</Heading>
	<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-4 max-w-2xl">{artist.lead}</Heading>
	<nav class="mt-8 flex flex-wrap gap-3" aria-label="Collections">
		{#each artist.collections as collection (collection.slug)}
			<a href="#{collection.slug}" class="border-2 border-ink px-4 py-2 transition-colors hover:bg-ink hover:text-surface">
				<Heading level={5} tag="span" size="sm" weight="semibold" balance={false}>{collection.title}</Heading>
			</a>
		{/each}
	</nav>
</Section>

{#each artist.collections as collection (collection.slug)}
	<Section id={collection.slug} tone="surface" class="border-t-2 border-ink">
		<div class="flex items-baseline justify-between gap-4">
			<Heading level={2} size="xl">{collection.title}</Heading>
			<Heading level={5} tag="p" size="sm" tone="muted" balance={false} class="whitespace-nowrap">{collection.works.length} works</Heading>
		</div>
		{#if collection.lead}
			<Heading level={4} tag="p" weight="medium" tone="muted" class="mt-3 max-w-2xl">{collection.lead}</Heading>
		{/if}
		{#if collection.mural}
			<div class="mt-8 overflow-x-auto bg-fill" data-lenis-prevent>
				<img src={collection.mural} alt="{collection.title}, all panels in sequence" loading="lazy" decoding="async" class="block h-40 w-auto max-w-none md:h-64" />
			</div>
			<Heading level={6} tag="p" size="xs" tone="muted" balance={false} class="mt-2">Scroll along the mural →</Heading>
		{/if}
		<div class="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
			{#each collection.works as work (work.slug)}
				<a href="{data.base}/{work.slug}" class="group flex flex-col">
					<div class={cn('relative w-full overflow-hidden bg-fill', collection.landscape ? 'aspect-4/3' : 'aspect-square')}>
						<LazyImage src={work.photoSm ?? work.digitalSm} alt={work.title} class="absolute inset-0 h-full w-full object-cover" />
						{#if work.photoSm}
							<img
								src={work.digitalSm}
								alt=""
								loading="lazy"
								decoding="async"
								class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
							/>
						{/if}
					</div>
					<Heading level={3} tag="span" size="sm" sizeMd="base" weight="semibold" balance={false} class="mt-3">{work.title}</Heading>
				</a>
			{/each}
		</div>
	</Section>
{/each}
