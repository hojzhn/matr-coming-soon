<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import Heading from './Heading.svelte';
	import Icon from './Icon.svelte';
	import { lenisState } from '$lib/lenis.svelte';

	let {
		open,
		title,
		onclose,
		children
	}: {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	} = $props();

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	$effect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		lenisState.instance?.stop();
		return () => {
			document.body.style.overflow = prevOverflow;
			lenisState.instance?.start();
		};
	});
</script>

<svelte:window onkeydown={open ? onkeydown : undefined} />

{#if open}
	<div class="fixed inset-0 z-110">
		<button
			type="button"
			class="absolute inset-0 bg-shade/10"
			aria-label="Close"
			onclick={onclose}
			transition:fade={{ duration: 200 }}
		></button>
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center p-4 md:p-8">
			<div
				class="pointer-events-auto flex max-h-[85vh] w-full max-w-2xl flex-col bg-surface border-2"
				role="dialog"
				aria-modal="true"
				aria-label={title}
				transition:fly={{ y: 16, duration: 250 }}
			>
				<div class="flex shrink-0 items-center justify-between border-b border-line px-6 py-4 md:px-8">
					<Heading level={3} tag="p">{title}</Heading>
					<button
						type="button"
						onclick={onclose}
						aria-label="Close"
						class="text-ink-faint transition-colors hover:text-ink"
					>
						<Icon name="close" class="h-5 w-5" />
					</button>
				</div>
				<div data-lenis-prevent class="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}
