<script lang="ts">
	import Heading, { type HeadingSize } from './Heading.svelte';
	import Icon, { type IconName } from './Icon.svelte';
	import Spinner from './Spinner.svelte';
	import { cn } from '$lib/cn';
	import { DitherFill } from '$lib/dither';

	let {
		href,
		label,
		icon,
		arrow = true,
		external = false,
		samepage = false,
		type = 'button',
		variant = 'link',
		fill = 'ink',
		disabled = false,
		loading = false,
		onclick,
		size = 'sm',
		sizeMd,
		class: className
	}: {
		href?: string;
		label: string;
		icon?: IconName;
		arrow?: boolean;
		external?: boolean;
		samepage?: boolean;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'link' | 'button';
		fill?: 'ink' | 'surface';
		disabled?: boolean;
		loading?: boolean;
		onclick?: (e: MouseEvent) => void;
		size?: HeadingSize;
		sizeMd?: HeadingSize;
		class?: string;
	} = $props();

	let canvasEl = $state<HTMLCanvasElement | undefined>();
	let dither: DitherFill | null = null;

	$effect(() => {
		if (!canvasEl) return;
		const color = getComputedStyle(canvasEl).color;
		const m = color.match(/\d+(?:\.\d+)?/g);
		const rgb: [number, number, number] = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
		const instance = new DitherFill(canvasEl, { px: 1, soft: 0.6, color: rgb });
		dither = instance;
		return () => instance.destroy();
	});

	function onEnter() {
		if (disabled || loading) return;
		dither?.animateTo(1, 300);
	}
	function onLeave() {
		dither?.animateTo(0, 240);
	}

	const fillColor = $derived(fill === 'surface' ? 'text-surface' : 'text-ink');
	const hoverText = $derived(fill === 'surface' ? 'group-hover:text-ink' : 'group-hover:text-surface');
	const borderColor = $derived(fill === 'surface' ? 'border-surface' : 'border-ink');

	const variantClass = $derived(
		variant === 'button' ? cn('border-2 px-6 py-3 justify-center', borderColor) : 'px-3 py-1'
	);
</script>

{#snippet content()}
	<canvas
		bind:this={canvasEl}
		class={cn(
			'pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]',
			fillColor
		)}
	></canvas>
	<Heading
		level={4}
		tag="span"
		{size}
		{sizeMd}
		weight="medium"
		tracking="tight"
		class={cn('relative inline-flex items-center gap-2 transition-colors duration-300 ease-out', hoverText)}
	>
		{#if icon}
			<Icon name={icon} class="h-[0.9em] w-[0.9em] shrink-0" />
		{/if}
		{label}
		{#if loading}
			<Spinner class="h-4 w-4" />
		{:else if arrow}
			<Icon
				name="arrow-right"
				class="h-[0.9em] w-[0.9em] shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
			/>
		{/if}
	</Heading>
{/snippet}

{#if href}
	<a
		{href}
		target={external ? '_blank' : undefined}
		rel={external ? 'noreferrer' : undefined}
		data-sveltekit-preload-data={samepage ? 'off' : undefined}
		onmouseenter={onEnter}
		onmouseleave={onLeave}
		class={cn('group relative inline-flex w-fit items-center overflow-hidden', variantClass, className)}
	>
		{@render content()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{onclick}
		onmouseenter={onEnter}
		onmouseleave={onLeave}
		class={cn(
			'group relative inline-flex w-fit items-center overflow-hidden disabled:cursor-not-allowed disabled:opacity-50',
			variantClass,
			className
		)}
	>
		{@render content()}
	</button>
{/if}
