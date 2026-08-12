<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import { relaunchContent, siteContent } from '$lib/content';
	import { DitherFill } from '$lib/dither';

	const links: { icon: IconName; href: string; label: string; external: boolean }[] = [
		{ icon: 'instagram', href: siteContent.social.instagram, label: 'Instagram', external: true },
		{ icon: 'twitter', href: siteContent.social.twitter, label: 'X / Twitter', external: true },
		{ icon: 'message', href: '#testimonials', label: 'Testimonials', external: false }
	];

	let canvasEl = $state<HTMLCanvasElement>();
	let dither: DitherFill | null = null;
	let revealed = $state(false);

	$effect(() => {
		if (!canvasEl) return;
		const color = getComputedStyle(canvasEl).color;
		const m = color.match(/\d+(?:\.\d+)?/g);
		const rgb: [number, number, number] = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [156, 163, 175];
		const instance = new DitherFill(canvasEl, { px: 2, soft: 0.6, color: rgb });
		dither = instance;
		return () => instance.destroy();
	});

	$effect(() => {
		function onScroll() {
			revealed = window.scrollY > window.innerHeight * 0.125;
		}
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		dither?.animateTo(revealed ? 1 : 0, revealed ? 600 : 450);
	});
</script>

<Section tone="surface" width="full" class="py-10 md:py-12">
	<div class="flex flex-col gap-6 xl:flex-row xl:items-end lg:justify-between relative xl:-mt-120">
	<div class="flex flex-col xl:flex-row xl:items-end gap-12">
	<div class="relative aspect-video overflow-hidden xl:aspect-4/5 xl:h-160">
		<canvas
			bind:this={canvasEl}
			class="absolute inset-0 h-full w-full text-ink-faint [image-rendering:pixelated]"
		></canvas>
	</div>
		<Heading
			level={4}
			tag="p"
			size="base"
			sizeMd="lg"
			weight="medium"
			tracking="tight"
			tone="ink"
			class="md:max-w-2xl"
		>
			{relaunchContent.text}
		</Heading>
		</div>
		<div class="flex items-center gap-3">
			{#each links as link (link.label)}
				<a
					href={link.href}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noreferrer' : undefined}
					aria-label={link.label}
					class="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
				>
					<Icon name={link.icon} class="h-4.5 w-4.5 text-ink-muted transition-colors group-hover:text-brand" />
				</a>
			{/each}
		</div>

	
	</div>
</Section>
