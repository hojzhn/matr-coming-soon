<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { galleryContent } from '$lib/content';
	import { fade } from 'svelte/transition';

	let isDesktop = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		function update() {
			isDesktop = mq.matches;
		}
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	const columnCount = $derived(isDesktop ? 3 : 2);

	const columns = $derived.by(() => {
		const cols: { item: (typeof galleryContent.items)[number]; i: number }[][] = Array.from(
			{ length: columnCount },
			() => []
		);
		galleryContent.items.forEach((item, i) => {
			cols[i % columnCount].push({ item, i });
		});
		return cols;
	});

	function columnBase(col: number): number {
		return col % 2 === 0 ? 0 : 56;
	}

	function columnDuration(col: number): number {
		return 22 + col * 7;
	}

	function columnDirection(col: number): 'normal' | 'reverse' {
		return col % 2 === 0 ? 'normal' : 'reverse';
	}

	function columnParallaxSpeed(col: number): number {
		return (col % 2 === 0 ? -1 : 1) * (180 + col * 60);
	}

	let galleryEl = $state<HTMLElement>();
	let scrollY = $state(0);
	let reduceMotion = $state(false);

	const scrollProgress = $derived.by(() => {
		scrollY;
		if (!galleryEl || reduceMotion) return 0.5;
		const rect = galleryEl.getBoundingClientRect();
		const vh = window.innerHeight;
		const total = rect.height + vh;
		return Math.min(1, Math.max(0, (vh - rect.top) / total));
	});

	$effect(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let ticking = false;
		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				scrollY = window.scrollY;
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => window.removeEventListener('scroll', onScroll);
	});

	let failed = $state<boolean[]>(galleryContent.items.map(() => false));
	let loaded = $state<boolean[]>(galleryContent.items.map(() => false));
	let aspectRatios = $state<number[]>(galleryContent.items.map(() => 1));
	let openIndex = $state<number | null>(null);

	$effect(() => {
		galleryContent.items.forEach((item, i) => {
			const img = new Image();
			img.onload = () => {
				aspectRatios[i] = img.naturalWidth / img.naturalHeight;
				loaded[i] = true;
			};
			img.onerror = () => (failed[i] = true);
			img.src = item.src;
		});
	});

	function open(i: number) {
		openIndex = i;
	}

	function close() {
		openIndex = null;
	}

	function next() {
		if (openIndex === null) return;
		openIndex = (openIndex + 1) % galleryContent.items.length;
	}

	function prev() {
		if (openIndex === null) return;
		openIndex = (openIndex - 1 + galleryContent.items.length) % galleryContent.items.length;
	}

	$effect(() => {
		if (openIndex === null) return;

		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
			else if (e.key === 'ArrowLeft') prev();
			else if (e.key === 'ArrowRight') next();
		}

		window.addEventListener('keydown', onKeydown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			window.removeEventListener('keydown', onKeydown);
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

<Section id="gallery" tone="surface" contained={false} class="my-20">
	<div bind:this={galleryEl} class="gallery-grid">
		<div class="flex gap-3 md:gap-4">
			{#each columns as column, col (col)}
				<div
					class="h-screen md:h-[150vh] flex-1 overflow-hidden"
					style="transform: translateY({columnBase(col) +
						(scrollProgress - 0.5) * columnParallaxSpeed(col)}px)"
				>
					<div
						class="marquee-track flex flex-col gap-3 md:gap-4"
						style="--marquee-duration: {columnDuration(col)}s; --marquee-direction: {columnDirection(
							col
						)}"
					>
						{#each [...column, ...column] as { item, i }, dupIndex (item.src + '-' + dupIndex)}
							<button
								type="button"
								onclick={() => open(i)}
								style="aspect-ratio: {aspectRatios[i]}"
								class="group relative shrink-0 overflow-hidden bg-fill-soft/60 transition-all duration-300"
							>
								{#if loaded[i]}
									<img
										src={item.src}
										alt={item.alt}
										transition:fade={{ duration: 300 }}
										class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								{:else}
									<div class="absolute inset-0 flex items-center justify-center bg-gray-400">
										<Heading level={5} tag="p" >Image placeholder</Heading>
									</div>
								{/if}

							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</Section>

{#if openIndex !== null}
	{@const item = galleryContent.items[openIndex]}
	<div
		class="fixed inset-0 z-[100] flex flex-col bg-surface p-4 md:p-10"
		role="dialog"
		aria-modal="true"
		aria-label={item.caption || item.alt}
		tabindex="-1"
		onclick={close}
		onkeydown={(e) => {
			if (e.key === 'Escape') close();
		}}
	>
		<button
			type="button"
			onclick={(e) => {
				e.stopPropagation();
				close();
			}}
			aria-label="Close"
			class="absolute right-4 top-4 text-ink transition-colors hover:text-ink-faint md:right-8 md:top-8"
		>
			<Icon name="close" class="h-7 w-7" />
		</button>

		{#if galleryContent.items.length > 1}
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					prev();
				}}
				aria-label="Previous image"
				class="absolute left-2 top-1/2 -translate-y-1/2 text-ink transition-colors hover:text-ink-faint md:left-6"
			>
				<Icon name="arrow-right" class="h-8 w-8 rotate-180" />
			</button>
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					next();
				}}
				aria-label="Next image"
				class="absolute right-2 top-1/2 -translate-y-1/2 text-ink transition-colors hover:text-ink-faint md:right-6"
			>
				<Icon name="arrow-right" class="h-8 w-8" />
			</button>
		{/if}

		<div class="flex flex-1 items-center justify-center overflow-hidden">
			{#if loaded[openIndex]}
				<div
					role="presentation"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
				>
					<img
						src={item.src}
						alt={item.alt}
						transition:fade={{ duration: 300 }}
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			{:else}
				<div class="flex aspect-4/5 max-h-full w-[70vw] items-center justify-center bg-gray-400">
					<Heading level={5} tag="p" >Image placeholder</Heading>
				</div>
			{/if}
		</div>

		{#if item.caption}
			<Heading level={5} tag="p" align="center" class="mt-4 shrink-0">
				{item.caption}
			</Heading>
		{/if}
	</div>
{/if}

<style>
	.marquee-track {
		width: 100%;
		animation: marquee-loop var(--marquee-duration, 30s) linear infinite;
		animation-direction: var(--marquee-direction, normal);
	}

	.marquee-track:hover {
		animation-play-state: paused;
	}

	@keyframes marquee-loop {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}

	.gallery-grid:has(button:hover) button:not(:hover) {
		opacity: 0.8;
	}
</style>
