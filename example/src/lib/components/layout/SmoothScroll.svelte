<script lang="ts">
	import { onMount } from 'svelte';
	import Lenis from 'lenis';
	import { lenisState } from '$lib/lenis.svelte';

	onMount(() => {
		const lenis = new Lenis({ anchors: true });
		lenisState.instance = lenis;

		let raf = requestAnimationFrame(function loop(time) {
			lenis.raf(time);
			raf = requestAnimationFrame(loop);
		});

		return () => {
			cancelAnimationFrame(raf);
			lenis.destroy();
			lenisState.instance = null;
		};
	});
</script>
