<script lang="ts" module>
	export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
	export type HeadingTag = `h${HeadingLevel}` | 'p' | 'span' | 'div';
	export type HeadingSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
	export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
	export type HeadingLeading = 'none' | 'tighter' | 'tight' | 'snug' | 'normal' | 'relaxed';
	export type HeadingTracking = 'tighter' | 'tight' | 'normal' | 'wide' | 'widest';
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
		trackingMd,
		align = 'left',
		tone,
		eyebrow = false,
		uppercase = false,
		balance = true,
		underline = false,
		strike = false,
		stroke = false,
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
		trackingMd?: HeadingTracking;
		align?: 'left' | 'center';
		tone?: HeadingTone;
		eyebrow?: boolean;
		uppercase?: boolean;
		balance?: boolean;
		underline?: boolean;
		strike?: boolean;
		stroke?: boolean;
		class?: string;
		children: Snippet;
	} = $props();

	const Tag = $derived(tag ?? (`h${level}` as const));

	const defaultSize: Record<HeadingLevel, HeadingSize> = {
		1: '2xl',
		2: 'lg',
		3: 'base',
		4: 'base',
		5: 'sm',
		6: 'xs'
	};

	const defaultSizeMd: Partial<Record<HeadingLevel, HeadingSize>> = {
		3: 'lg',
		4: 'md'
	};

	const resolvedSize = $derived(size ?? (eyebrow ? 'xs' : defaultSize[level]));
	const resolvedSizeMd = $derived(sizeMd ?? (eyebrow ? undefined : defaultSizeMd[level]));
	const resolvedWeight = $derived(
		weight ?? (eyebrow ? 'medium' : level === 1 || level === 2 ? 'bold' : 'semibold')
	);
	const resolvedTone = $derived(tone ?? (eyebrow ? 'muted' : undefined));
	const resolvedTracking = $derived(tracking ?? (uppercase ? 'wide' : 'tight'));
	const resolvedLeading = $derived(leading ?? (resolvedSize === '2xl' ? 'tighter' : 'tight'));

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
		wide: 'tracking-wide',
		widest: 'tracking-widest'
	};

	const mdTrackings: Record<HeadingTracking, string> = {
		tighter: 'md:tracking-tighter',
		tight: 'md:tracking-tight',
		normal: 'md:tracking-normal',
		wide: 'md:tracking-wide',
		widest: 'md:tracking-widest'
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
		resolvedSizeMd && mdSizes[resolvedSizeMd],
		weights[resolvedWeight],
		leadings[resolvedLeading],
		trackings[resolvedTracking],
		trackingMd && mdTrackings[trackingMd],
		align === 'center' && 'text-center',
		resolvedTone && tones[resolvedTone],
		uppercase && 'uppercase',
		underline && 'underline underline-offset-4',
		strike && 'line-through',
		className
	)}
	style={stroke
		? 'text-shadow: 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;'
		: undefined}
>
	{@render children()}
</svelte:element>
