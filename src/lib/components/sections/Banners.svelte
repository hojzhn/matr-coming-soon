<script lang="ts">
	import { fade } from 'svelte/transition';
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import DitherBackdrop from '$lib/components/ui/DitherBackdrop.svelte';
	import SwapText from '$lib/components/ui/SwapText.svelte';
	import { bannersContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';

	const banners = bannersContent.items;

	let activeIndex = $state(0);
	let ctaHovered = $state(false);
	const active = $derived(banners[activeIndex]);

	function select(index: number) {
		if (index === activeIndex) return;
		activeIndex = index;
	}
</script>

<Section tone="surface" contained={false} class="py-0">
	<div class="grid grid-cols-2 border-y-2 border-ink md:grid-cols-3">
		{#each banners as banner, i (banner.href)}
			{@const selected = i === activeIndex}
			<a
				href={banner.href}
				aria-label={`${bannersContent.ctaPrefix} ${banner.heading}`}
				onmouseenter={() => select(i)}
				onfocus={() => select(i)}
				onclick={() => trackEvent('home_banner_click', { to: banner.href })}
				class={cn('relative block aspect-3/4 overflow-hidden bg-fill md:aspect-square', i === 0 ? 'border-r-2 border-ink' : 'md:border-r-2 md:border-ink')}
			>
				<div
					class={cn(
						'absolute inset-0 transition-[filter] duration-500',
						selected ? 'grayscale-0 contrast-100' : 'grayscale contrast-50'
					)}
				>
					{#if banner.video}
						<LoopVideo src={banner.video} poster={banner.image} label={banner.alt} class="absolute inset-0 h-full w-full" />
					{:else}
						<LazyImage src={banner.image} alt={banner.alt} class="absolute inset-0 h-full w-full object-cover" />
					{/if}
				</div>
			</a>
		{/each}

		<div class="col-span-2 flex flex-col border-t-2 border-ink md:col-span-1 md:border-t-0">
			{#key activeIndex}
				<div in:fade={{ duration: 300 }} class="flex flex-1 flex-col gap-4 px-container py-6 md:px-8 md:py-8">
					<Heading level={2}  balance={false}>{active.heading}</Heading>
					<Heading level={3} tag="p" weight="medium" balance={false}>{active.body}</Heading>
				</div>
			{/key}
			<a
				href={active.href}
				aria-label={`${bannersContent.ctaPrefix} ${active.heading}`}
				onclick={() => trackEvent('home_banner_click', { to: active.href })}
				onmouseenter={() => (ctaHovered = true)}
				onmouseleave={() => (ctaHovered = false)}
				onfocus={() => (ctaHovered = true)}
				onblur={() => (ctaHovered = false)}
				class="group relative block overflow-hidden border-t-2 border-ink"
			>
				<DitherBackdrop active={ctaHovered} />
				<div class="relative flex items-center justify-between gap-4 px-container py-4 md:px-8">
					<Heading
						level={4}
						tag="span"
						size="md"
						sizeMd="lg"
						tone={ctaHovered ? 'surface' : 'ink'}
						class="transition-colors duration-300"
					>
						{bannersContent.ctaPrefix}
						<SwapText text={active.heading} />
					</Heading>
					<Icon
						name="arrow-right"
						class={cn(
							'h-6 w-6 shrink-0 transition-[color,transform] duration-300 ease-out group-hover:translate-x-2 md:h-7 md:w-7',
							ctaHovered ? 'text-surface' : 'text-ink'
						)}
					/>
				</div>
			</a>
		</div>
	</div>
</Section>
