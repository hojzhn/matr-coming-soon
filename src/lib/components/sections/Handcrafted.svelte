<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { handcraftedContent } from '$lib/content';

	const { heading, body, video } = handcraftedContent;

	let videoEl = $state<HTMLVideoElement>();
	let src = $state<string>();

	$effect(() => {
		const wide = window.matchMedia('(min-width: 768px)');
		const pick = () => (src = wide.matches ? video.desktop : video.phone);
		pick();
		wide.addEventListener('change', pick);
		return () => wide.removeEventListener('change', pick);
	});

	$effect(() => {
		if (!videoEl || !src) return;
		const el = videoEl;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) el.play().catch(() => {});
				else el.pause();
			},
			{ threshold: 0.2 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<Section id="handcrafted" tone="ink" contained={false} class="relative isolate flex min-h-[85svh] flex-col justify-end overflow-hidden py-0">
	<div aria-hidden="true" class="absolute inset-0 -z-10">
		<picture>
			<source media="(min-width: 768px)" srcset={video.posterDesktop} />
			<img src={video.posterPhone} alt="" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
		</picture>
		{#if src}
			<video
				bind:this={videoEl}
				{src}
				muted
				loop
				playsinline
				preload="none"
				class="absolute inset-0 h-full w-full object-cover"
			></video>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-shade/85 via-shade/25 to-transparent"></div>
		<div class="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-shade/70 to-transparent"></div>
	</div>
	<Container class="pt-40 pb-16 md:pb-24">
		<Heading level={2} size="xl" sizeMd="hero" leading="none" tracking="tighter" tone="surface" balance={false}>{heading}</Heading>
		<span class="sr-only">{video.alt}</span>
	</Container>
</Section>

<Section tone="surface">
	<div class="max-w-[900px]">
		<Heading level={3} tag="p" weight="medium" balance={false}>{body}</Heading>
	</div>
</Section>
