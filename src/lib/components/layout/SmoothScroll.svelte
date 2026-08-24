<script lang="ts">
	import { onMount } from 'svelte';
	import Lenis from 'lenis';

	onMount(() => {
		const lenis = new Lenis();

		let raf = requestAnimationFrame(function loop(time) {
			lenis.raf(time);
			raf = requestAnimationFrame(loop);
		});

		return () => {
			cancelAnimationFrame(raf);
			lenis.destroy();
		};
	});
</script>
