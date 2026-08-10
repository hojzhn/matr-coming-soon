<script lang="ts" module>
	export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
	export type HeadingTag = `h${HeadingLevel}` | 'p' | 'span' | 'div';
	export type HeadingSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
	export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
	export type HeadingLeading = 'none' | 'tighter' | 'tight' | 'snug' | 'normal' | 'relaxed';
	export type HeadingTracking = 'tighter' | 'tight' | 'normal' | 'wide';
	export type HeadingTone = 'ink' | 'muted' | 'brand' | 'surface';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	let {
		level = 2,
		tag,
		size,
		sizeMd,
		weight,
		leading,
		tracking,
		align = 'left',
		tone,
		eyebrow = false,
		uppercase = false,
		balance = true,
		class: className,
		children
	}: {
		level?: HeadingLevel;
		tag?: HeadingTag;
		size?: HeadingSize;
		sizeMd?: HeadingSize;
		weight?: HeadingWeight;
		leading?: HeadingLeading;
		tracking?: HeadingTracking;
		align?: 'left' | 'center';
		tone?: HeadingTone;
		eyebrow?: boolean;
		uppercase?: boolean;
		balance?: boolean;
		class?: string;
		children: Snippet;
	} = $props();

	const Tag = $derived(tag ?? (`h${level}` as const));

	const defaultSize: Record<HeadingLevel, HeadingSize> = {
		1: 'xl',
		2: 'lg',
		3: 'md',
		4: 'base',
		5: 'sm',
		6: 'xs'
	};

	const resolvedSize = $derived(size ?? (eyebrow ? 'xs' : defaultSize[level]));
	const resolvedWeight = $derived(weight ?? (eyebrow ? 'medium' : 'semibold'));
	const resolvedTone = $derived(tone ?? (eyebrow ? 'muted' : undefined));
	const resolvedTracking = $derived(tracking ?? (uppercase ? 'wide' : 'tight'));
	const resolvedLeading = $derived(leading ?? (resolvedSize === 'hero' ? 'none' : 'tight'));

	const sizes: Record<HeadingSize, string> = {
		xs: 'text-xs',
		sm: 'text-sm',
		base: 'text-base',
		md: 'text-md',
		lg: 'text-lg',
		xl: 'text-xl',
		'2xl': 'text-2xl',
		hero: 'text-hero'
	};

	const mdSizes: Record<HeadingSize, string> = {
		xs: 'md:text-xs',
		sm: 'md:text-sm',
		base: 'md:text-base',
		md: 'md:text-md',
		lg: 'md:text-lg',
		xl: 'md:text-xl',
		'2xl': 'md:text-2xl',
		hero: 'md:text-hero'
	};

	const weights: Record<HeadingWeight, string> = {
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold'
	};

	const leadings: Record<HeadingLeading, string> = {
		none: 'leading-none',
		tighter: 'leading-tighter',
		tight: 'leading-tight',
		snug: 'leading-snug',
		normal: 'leading-normal',
		relaxed: 'leading-relaxed'
	};

	const trackings: Record<HeadingTracking, string> = {
		tighter: 'tracking-tighter',
		tight: 'tracking-tight',
		normal: 'tracking-normal',
		wide: 'tracking-wide'
	};

	const tones: Record<HeadingTone, string> = {
		ink: 'text-ink',
		muted: 'text-ink-muted',
		brand: 'text-brand',
		surface: 'text-surface'
	};
</script>

<svelte:element
	this={Tag}
	class={cn(
		'font-sans whitespace-pre-line',
		balance && 'text-balance',
		sizes[resolvedSize],
		sizeMd && mdSizes[sizeMd],
		weights[resolvedWeight],
		leadings[resolvedLeading],
		trackings[resolvedTracking],
		align === 'center' && 'text-center',
		resolvedTone && tones[resolvedTone],
		uppercase && 'uppercase',
		className
	)}
>
	{@render children()}
</svelte:element>
