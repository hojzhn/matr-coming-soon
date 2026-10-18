<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import HeroStatement from '$lib/components/sections/HeroStatement.svelte';
	import Banners from '$lib/components/sections/Banners.svelte';
	import Handcrafted from '$lib/components/sections/Handcrafted.svelte';
	import ArtistClients from '$lib/components/sections/ArtistClients.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import Testimonials from '$lib/components/sections/Testimonials.svelte';
	import { heroContent } from '$lib/content';
</script>

<Hero hero={heroContent.home} peek={heroContent.oilEdition} logos>
	{#snippet stage()}
		<HeroStatement
			punches={heroContent.home.punches ?? [{ text: heroContent.home.headline }]}
			taglineLines={heroContent.home.taglineLines ?? [heroContent.home.description]}
			tagline={heroContent.home.description}
		/>
	{/snippet}
</Hero>
<Handcrafted />
<ArtistClients />
<Gallery />
<Banners />

<video
	src="/videos/paint-area.mp4"
	autoplay
	muted
	loop
	playsinline
	class="h-screen w-full object-cover md:my-20 contrast-130 brightness-110"
></video>
<Testimonials />
