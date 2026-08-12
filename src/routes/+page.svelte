<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import FloatingOrderCta from '$lib/components/layout/FloatingOrderCta.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Relaunch from '$lib/components/sections/Relaunch.svelte';
	import OrderSection from '$lib/components/sections/OrderSection.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import Testimonials from '$lib/components/sections/Testimonials.svelte';
	import Contact from '$lib/components/sections/Contact.svelte';

	let { data } = $props();
</script>

<Header />
<FloatingOrderCta />

<main>
	<Hero />
	<Relaunch />
	<img
		src="/images/dividers/brush-divider-1.png"
		alt=""
		class="h-10 w-full object-cover md:object-contain md:h-18 md:my-12"
	/>
	<OrderSection formToken={data.formToken} />
	<img
		src="/images/dividers/brush-divider-2.png"
		alt=""
		class="h-10 w-full object-cover  md:object-contain md:h-18 md:my-12"
	/>
	<Gallery />
	<div class="w-full h-screen bg-gray-400"></div>
	<Testimonials />
	<!-- <Contact formToken={data.formToken} /> -->
</main>

<Footer formToken={data.formToken} />
