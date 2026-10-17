<script lang="ts">
	import { page } from '$app/state';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { heroPages, heroPageIndex } from '$lib/hero/pages';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { brandsContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';
	import { smoothScrollIfSamePage } from '$lib/scroll';
	import type { Snippet } from 'svelte';
	import type { HeroVariant } from '$lib/content/types';

	let {
		hero,
		peek,
		stage,
		logos = false
	}: { hero: HeroVariant; peek?: HeroVariant; stage?: Snippet; logos?: boolean } = $props();

	const carouselImages = $derived(hero.background ? [] : (hero.images ?? []));
	const headlineLines = $derived(hero.headline.split('\n'));

	const currentIndex = $derived(Math.max(0, heroPageIndex(page.url.pathname)));
	const prevPage = $derived(heroPages[(currentIndex - 1 + heroPages.length) % heroPages.length]);
	const nextPage = $derived(heroPages[(currentIndex + 1) % heroPages.length]);
	const counter = $derived(
		`${String(currentIndex + 1).padStart(2, '0')} / ${String(heroPages.length).padStart(2, '0')}`
	);

	const contentStart = $derived(headlineLines.length + 1);

	function line(step: number) {
		return `view-transition-name: hero-p${currentIndex}-${step}; view-transition-class: hero-line hero-d${step};`;
	}

	let activeIndex = $state(0);
	let readyCount = $state(0);

	$effect(() => {
		carouselImages.forEach((src) => {
			const img = new Image();
			img.src = src;
			img.decode().catch(() => {}).finally(() => (readyCount += 1));
		});
	});

	$effect(() => {
		if (!carouselImages.length || readyCount < carouselImages.length) return;
		const id = setInterval(() => {
			activeIndex = (activeIndex + 1) % carouselImages.length;
		}, 750);
		return () => clearInterval(id);
	});

	const peekImage = $derived(peek?.background?.image ?? peek?.images?.[0]);
	const ctaInPage = $derived(hero.cta.href.startsWith('#'));
	let ctaHovered = $state(false);
	let peekLoaded = $state(false);
	const peeking = $derived(ctaHovered && !ctaInPage && !!peek);
	const nudging = $derived(ctaHovered && ctaInPage);

	function showPeek() {
		ctaHovered = true;
		if (peek && !ctaInPage) peekLoaded = true;
	}

	function hidePeek() {
		ctaHovered = false;
	}

	function onCtaClick(event: MouseEvent) {
		trackEvent('hero_cta_click', { to: hero.cta.href });
		smoothScrollIfSamePage(event, hero.cta.href);
	}
</script>

{#snippet pagerLink(target: { label: string; href: string }, direction: 'prev' | 'next')}
	<a
		href={target.href}
		aria-label={`${direction === 'prev' ? 'Previous' : 'Next'}: ${target.label}`}
		onclick={() => trackEvent('hero_pager_click', { direction, to: target.href })}
		class={cn(
			'group pointer-events-auto flex flex-col gap-3',
			direction === 'prev' ? 'items-start' : 'items-end'
		)}
	>
		<span
			style={`view-transition-name: hero-${direction};`}
			class="flex h-12 w-12 items-center justify-center rounded-full border border-surface/40 bg-shade/30 text-surface backdrop-blur-sm transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-ink md:h-16 md:w-16"
		>
			<Icon
				name="arrow-right"
				class={cn(
					'h-5 w-5 transition-transform duration-300 ease-out md:h-6 md:w-6',
					direction === 'prev' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
				)}
			/>
		</span>
	</a>
{/snippet}

<div class={cn('relative overflow-hidden perspective-[2000px]', ctaInPage ? 'bg-surface' : 'bg-ink-strong')}>
{#if peek && !ctaInPage}
	<div
		aria-hidden="true"
		class={cn(
			'pointer-events-none absolute inset-0 origin-left bg-canvas-from transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
			peeking ? 'transform-[translateX(92%)_rotateY(82deg)]' : 'transform-[translateX(100%)_rotateY(90deg)]'
		)}
	>
		{#if peekLoaded && peekImage}
			<img
				src={peekImage}
				alt=""
				decoding="async"
				class="absolute inset-0 h-full w-full object-contain object-right pr-20 md:pr-28"
			/>
		{/if}
	</div>
{/if}

<div
	aria-hidden="true"
	class={cn(
		'pointer-events-none absolute inset-0 origin-right bg-canvas-from transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
		peeking && 'transform-[translateX(-8%)_rotateY(-8deg)]',
		nudging && '-translate-y-10'
	)}
></div>

<Section
	id="top"
	tone="ink"
	fullHeight
	contained={false}
	class="relative isolate justify-between overflow-hidden bg-transparent"
>
	{#if hero.background}
		<div aria-hidden="true" class="absolute inset-0 -z-10 overflow-hidden">
			{#if hero.background.video}
				<video
					src={hero.background.video}
					poster={hero.background.image}
					autoplay
					muted
					loop
					playsinline
					class="absolute inset-0 h-full w-full object-cover"
				></video>
			{:else}
				<img
					src={hero.background.image}
					alt=""
					loading="eager"
					decoding="async"
					fetchpriority="high"
					class="absolute inset-0 h-full w-full origin-center object-cover animate-[ken-burns_24s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
				/>
			{/if}
			<div class="absolute inset-0 bg-linear-to-t from-shade/85 via-shade/25 to-transparent"></div>
			<div class="absolute inset-0 bg-linear-to-r from-shade/55 via-shade/10 to-transparent"></div>
		</div>
	{/if}
	<div class="relative  w-full flex-1 min-h-0">
		<div
			class={cn(
				'absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
				nudging && '-translate-y-10'
			)}
		>
		{#each carouselImages as src, i (src)}
			<img
				{src}
				alt=""
				loading="eager"
				decoding="async"
				fetchpriority={i === 0 ? 'high' : 'low'}
				class={cn(
					'absolute inset-0 h-full w-full object-contain object-right pr-20 mt-20 md:pr-28 md:mt-0',
					i === activeIndex ? 'opacity-100' : 'opacity-0'
				)}
			/>
		{/each}
		</div>

		{#if stage}
			{@render stage()}
		{:else}
			<div class="absolute inset-x-0 bottom-0 px-container md:px-28">
				<Heading level={1} size="hero" leading="none" tracking="tighter" tone="surface" balance={false} class="max-w-3xl">
					{#each headlineLines as text, i (i)}
						<span class="block w-fit" style={line(i + 1)}>{text}</span>
					{/each}
				</Heading>
			</div>
		{/if}
	</div>

	<div class="pointer-events-none absolute inset-0 z-10 hidden items-center justify-between px-6 md:flex">
		{@render pagerLink(prevPage, 'prev')}
		{@render pagerLink(nextPage, 'next')}
	</div>

	<div class="mt-10 mb-12 shrink-0 px-container md:mt-14 md:px-28">
		<div class="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
			<div
				role="presentation"
				onmouseenter={showPeek}
				onmouseleave={hidePeek}
				onfocusin={showPeek}
				onfocusout={hidePeek}
			>
			<a
				href={hero.cta.href}
				onclick={onCtaClick}
				style={line(contentStart)}
				class="group inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-ink shadow-xl transition-colors duration-300 hover:bg-brand-accent md:px-10 md:py-5"
			>
				<Heading level={4} tag="span" size="md" sizeMd="lg" weight="semibold" tone="ink">{hero.cta.label}</Heading>
				<Icon
					name="arrow-right"
					class={cn(
						'h-5 w-5 shrink-0 transition-transform duration-300 ease-out',
						ctaInPage ? 'rotate-90 group-hover:translate-y-1' : 'group-hover:translate-x-1'
					)}
				/>
			</a>
			</div>
			<div style={line(contentStart + 1)} class="flex items-center gap-4">
				<a
					href={prevPage.href}
					aria-label={`Previous: ${prevPage.label}`}
					onclick={() => trackEvent('hero_pager_click', { direction: 'prev', to: prevPage.href })}
					class="flex h-10 w-10 items-center justify-center rounded-full border border-surface/40 text-surface transition-colors duration-300 active:border-brand active:bg-brand active:text-ink md:hidden"
				>
					<Icon name="arrow-right" class="h-4 w-4 rotate-180" />
				</a>
				<Heading level={6} tag="span" tone="muted" tracking="wide" uppercase>{counter}</Heading>
				<a
					href={nextPage.href}
					aria-label={`Next: ${nextPage.label}`}
					onclick={() => trackEvent('hero_pager_click', { direction: 'next', to: nextPage.href })}
					class="flex h-10 w-10 items-center justify-center rounded-full border border-surface/40 text-surface transition-colors duration-300 active:border-brand active:bg-brand active:text-ink md:hidden"
				>
					<Icon name="arrow-right" class="h-4 w-4" />
				</a>
			</div>
		</div>

		{#if logos}
			<div
				style={line(contentStart + 2)}
				class="mt-10 grid grid-cols-4 items-center justify-items-center gap-x-6 gap-y-5 md:mt-14 md:flex md:justify-between md:gap-x-6"
			>
				{#each brandsContent.items as brand (brand.src)}
					<div class="flex h-4 min-w-0 items-center justify-center md:h-5">
						<LazyImage
							src={brand.src}
							alt={brand.name}
							class="h-full w-auto max-w-full shrink-0 object-contain object-center opacity-50 brightness-0 invert transition-opacity hover:opacity-100"
						/>
					</div>
				{/each}
			</div>
		{/if}

		{#if !stage}
			<div class="mt-12" style={line(contentStart + 2)}>
				<Heading level={4} tag="p" size="md" sizeMd="lg" weight="medium" leading="snug" tone="surface" class="max-w-3xl">{hero.description}</Heading>
			</div>
		{/if}
	</div>
</Section>
</div>
