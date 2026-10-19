<script lang="ts" module>
	export type ContainerWidth = 'default' | 'narrow' | 'full';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	let {
		tag = 'div',
		width = 'default',
		class: className,
		children
	}: {
		tag?: keyof HTMLElementTagNameMap;
		width?: ContainerWidth;
		class?: string;
		children: Snippet;
	} = $props();

	const widths: Record<ContainerWidth, string> = {
		default: 'max-w-[var(--container-max)]',
		narrow: 'max-w-3xl',
		full: 'max-w-none'
	};
</script>

<svelte:element this={tag} class={cn('mx-auto w-full px-container', widths[width], className)}>
	{@render children()}
</svelte:element>
