<script lang="ts">
	import { fade } from 'svelte/transition';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let visible = $state(true);

	$effect(() => {
		const id = setTimeout(() => (visible = false), 500);
		return () => clearTimeout(id);
	});
</script>

{#if visible}
	<div
		out:fade={{ duration: 300 }}
		class="fixed inset-0 z-[200] flex items-center justify-center bg-canvas-from"
	>
		<Spinner class="h-8 w-8 text-surface" />
	</div>
{/if}
