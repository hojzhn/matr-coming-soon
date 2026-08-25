<script lang="ts">
	import './layout.css';
	import Preloader from '$lib/components/layout/Preloader.svelte';
	import SmoothScroll from '$lib/components/layout/SmoothScroll.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Matr Labs: Engineering for Art</title>
	<meta name="description" content="Oil prints made to order. Matr labs is coming back soon." />
	<script async src="https://t.contentsquare.net/uxa/ae8b39acc16e9.js"></script>
</svelte:head>

<Preloader />
<SmoothScroll />

{@render children()}
