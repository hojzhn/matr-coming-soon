<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Banners from '$lib/components/sections/Banners.svelte';
	import Handcrafted from '$lib/components/sections/Handcrafted.svelte';
	import ArtistClients from '$lib/components/sections/ArtistClients.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import Testimonials from '$lib/components/sections/Testimonials.svelte';
	import { heroContent } from '$lib/content';
</script>

<Hero hero={heroContent.home} peek={heroContent.oilEdition} logos />
<Handcrafted />
<Banners />
<ArtistClients />
<Gallery />
<Testimonials />
