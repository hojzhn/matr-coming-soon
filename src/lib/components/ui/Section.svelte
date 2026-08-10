<script lang="ts" module>
	export type SectionTone = 'canvas' | 'surface' | 'ink';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';
	import Container, { type ContainerWidth } from './Container.svelte';

	let {
		tag = 'section',
		tone = 'canvas',
		contained = true,
		fullHeight = false,
		width = 'default',
		id,
		class: className,
		children
	}: {
		tag?: keyof HTMLElementTagNameMap;
		tone?: SectionTone;
		contained?: boolean;
		fullHeight?: boolean;
		width?: ContainerWidth;
		id?: string;
		class?: string;
		children: Snippet;
	} = $props();

	const tones: Record<SectionTone, string> = {
		canvas: 'bg-fill-soft text-ink',
		surface: 'bg-surface text-ink',
		ink: 'bg-canvas-from text-surface'
	};
</script>

<svelte:element
	this={tag}
	{id}
	class={cn(
		'py-section',
		tones[tone],
		fullHeight && 'flex min-h-dvh flex-col justify-center',
		className
	)}
>
	{#if contained}
		<Container {width} class={fullHeight ? 'w-full' : undefined}>
			{@render children()}
		</Container>
	{:else}
		{@render children()}
	{/if}
</svelte:element>
