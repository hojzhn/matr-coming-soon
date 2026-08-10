<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import FloatingOrderCta from '$lib/components/layout/FloatingOrderCta.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Relaunch from '$lib/components/sections/Relaunch.svelte';
	import OrderSection from '$lib/components/sections/OrderSection.svelte';
	import Testimonials from '$lib/components/sections/Testimonials.svelte';

	let { data } = $props();
</script>

<Header />
<FloatingOrderCta />

<main>
	<Hero />
	<Relaunch />
	<OrderSection formToken={data.formToken} />
	<Testimonials />
</main>

<Footer formToken={data.formToken} />
