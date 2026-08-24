<script lang="ts">
	import './layout.css';
	import Preloader from '$lib/components/layout/Preloader.svelte';
	import SmoothScroll from '$lib/components/layout/SmoothScroll.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>matr labs</title>
	<meta name="description" content="Oil prints made to order. Matr labs is coming back soon." />
</svelte:head>

<Preloader />
<SmoothScroll />

{@render children()}
