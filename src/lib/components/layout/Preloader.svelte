<script lang="ts">
	import { fade } from 'svelte/transition';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	let visible = $state(true);

	$effect(() => {
		const id = setTimeout(() => (visible = false), 500);
		return () => clearTimeout(id);
	});
</script>

{#if visible}
	<div
		out:fade={{ duration: 300 }}
		class="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-canvas-from"
	>
		<Spinner class="h-8 w-8 text-surface" />
		<Heading level={6} tag="p" size="xs" tone="surface">loading...</Heading>
	</div>
{/if}
