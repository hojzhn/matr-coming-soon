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
	import LazyImage from '$lib/components/ui/LazyImage.svelte';

	let { data } = $props();
</script>

<Header />
<FloatingOrderCta />

<main>
	<Hero />
	<Relaunch />
	<LazyImage
		src="/images/dividers/brush-divider-1.png"
		alt=""
		class="h-10 w-full object-cover md:object-contain md:h-20 md:my-12"
	/>
	<OrderSection formToken={data.formToken} />
	<LazyImage
		src="/images/dividers/brush-divider-2.png"
		alt=""
		class="h-10 w-full object-cover  md:object-contain md:h-22 md:my-12"
	/>
	<Gallery />
	<video
		src="/videos/paint-area.mp4"
		autoplay
		muted
		loop
		playsinline
		class="h-screen w-full object-cover md:my-20 contrast-130 brightness-110"
	></video>
	<Testimonials />
	<Contact formToken={data.formToken} />
</main>

<Footer formToken={data.formToken} />
