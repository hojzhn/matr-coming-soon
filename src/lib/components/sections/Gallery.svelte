<script lang="ts">
	import { fade } from 'svelte/transition';
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import SwapText from '$lib/components/ui/SwapText.svelte';
	import { galleryContent, testimonialsContent } from '$lib/content';
	import { lenisState } from '$lib/lenis.svelte';
	import { cn } from '$lib/cn';

	const items = galleryContent.items;

	const people = testimonialsContent.artists;

	let listOpen = $state(false);
	let hoveredIndex = $state<number | null>(null);
	let hoveredPerson = $state<string | null>(null);
	let openIndex = $state<number | null>(null);

	function workIndex(person: string) {
		return items.findIndex((item) => person.toLowerCase().includes(item.caption.toLowerCase()));
	}

	const highlightIndex = $derived(hoveredPerson === null ? hoveredIndex : workIndex(hoveredPerson));

	const trustedName = $derived(
		hoveredPerson ?? (hoveredIndex === null ? galleryContent.trustedDefault : items[hoveredIndex].caption)
	);

	const lineDelay = (i: number) => 300 + i * 18;
	const textDelay = (i: number) => 650 + i * 15;

	function toggleView() {
		listOpen = !listOpen;
		hoveredIndex = null;
		hoveredPerson = null;
	}

	function open(i: number) {
		openIndex = i;
	}

	function close() {
		openIndex = null;
	}

	function next() {
		if (openIndex === null) return;
		openIndex = (openIndex + 1) % items.length;
	}

	function prev() {
		if (openIndex === null) return;
		openIndex = (openIndex - 1 + items.length) % items.length;
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
		lenisState.instance?.stop();

		return () => {
			window.removeEventListener('keydown', onKeydown);
			document.body.style.overflow = prevOverflow;
			lenisState.instance?.start();
		};
	});
</script>

<Section id="gallery" tone="surface" contained={false} class="pt-0">
	<Container class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
		<Heading level={4} tag="h2" balance={false}>
			{galleryContent.trustedLabel}
			<span class="sr-only" aria-live="polite">{trustedName}</span>
			<Heading level={4} tag="span" weight="medium" balance={false}><SwapText text={trustedName} /></Heading>
		</Heading>
		<button
			type="button"
			onclick={toggleView}
			aria-expanded={listOpen}
			aria-controls="gallery-view"
			class="group inline-flex items-center gap-2"
		>
			<Heading level={4} tag="span" weight="medium" underline>
				{listOpen ? galleryContent.lessLabel : galleryContent.moreLabel}
			</Heading>
			<Icon
				name="arrow-right"
				class={cn(
					'h-5 w-5 shrink-0 transition-transform duration-200 ease-out',
					listOpen ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
				)}
			/>
		</button>
	</Container>

	<Container width="full">
	<div
		id="gallery-view"
		class="relative mt-6 flex aspect-16/27 flex-col md:aspect-64/27 md:flex-row"
	>
		<div
			data-lenis-prevent
			aria-hidden={!listOpen}
			inert={!listOpen}
			class={cn(
				'min-h-0 shrink-0 overflow-x-hidden transition-[width,height,margin] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] md:h-full',
				listOpen ? 'mb-2 h-1/2 overflow-y-auto overscroll-contain md:mr-4 md:mb-0 md:w-5/12' : 'h-0 overflow-y-hidden md:w-0'
			)}
		>
			<div class="min-w-64">
				<div
					class="pb-2 transition-opacity duration-300"
					style={listOpen ? `opacity: 1; transition-delay: ${textDelay(0)}ms` : 'opacity: 0'}
				>
					<Heading level={5} tag="p" >{testimonialsContent.artistsLabel}</Heading>
				</div>
				<ul>
					{#each people as person, i (person)}
						<li
							class="relative py-1"
							onmouseenter={() => (hoveredPerson = person)}
							onmouseleave={() => (hoveredPerson = null)}
						>
							<span
								aria-hidden="true"
								class="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-line transition-transform duration-500 ease-out"
								style={listOpen ? `transform: scaleX(1); transition-delay: ${lineDelay(i)}ms` : 'transform: scaleX(0)'}
							></span>
							<span
								class="block whitespace-nowrap transition-[opacity,translate] duration-300 ease-out"
								style={listOpen
									? `opacity: 1; translate: 0 0; transition-delay: ${textDelay(i)}ms`
									: 'opacity: 0; translate: 0 6px'}
							>
								<Heading level={5} tag="span" weight="medium" tone={hoveredPerson === person ? 'ink' : 'muted'}>
									{person}
								</Heading>
							</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="grid min-h-0 min-w-0 flex-1 grid-cols-2 grid-rows-6 gap-2 md:grid-cols-4 md:grid-rows-3 md:gap-4">
			{#each items as item, i (item.src)}
				<button
					type="button"
					onclick={() => open(i)}
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
					onfocus={() => (hoveredIndex = i)}
					onblur={() => (hoveredIndex = null)}
					aria-label={item.caption}
					class="relative min-h-0 overflow-hidden bg-fill"
				>
					<div
						class={cn(
							'absolute inset-0 transition-[filter] duration-500',
							highlightIndex === i ? 'grayscale-0 contrast-100 brightness-100' : 'grayscale contrast-50 brightness-125'
						)}
					>
						<LazyImage src={item.src} alt={item.alt} class="absolute inset-0 h-full w-full object-cover" />
					</div>
				</button>
			{/each}
		</div>
	</div>
	</Container>
</Section>

{#if openIndex !== null}
	{@const item = items[openIndex]}
	<div
		class="fixed inset-0 z-100 flex flex-col bg-surface p-4 md:p-10"
		role="dialog"
		aria-modal="true"
		aria-label={item.caption || item.alt}
		tabindex="-1"
		onclick={close}
		onkeydown={(e) => {
			if (e.key === 'Escape') close();
		}}
		transition:fade={{ duration: 200 }}
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

		{#if items.length > 1}
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

		<div class="flex min-h-0 flex-1 items-center justify-center">
			{#key openIndex}
				<img
					src={item.src}
					alt={item.alt}
					in:fade={{ duration: 300 }}
					role="presentation"
					onclick={(e) => e.stopPropagation()}
					class="max-h-full max-w-full object-contain"
				/>
			{/key}
		</div>

		{#if item.caption}
			<Heading level={5} tag="p" align="center" class="mt-4 shrink-0">
				{item.caption}
			</Heading>
		{/if}
	</div>
{/if}
