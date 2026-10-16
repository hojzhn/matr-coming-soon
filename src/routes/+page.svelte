<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import HeroStatement from '$lib/components/sections/HeroStatement.svelte';
	import Banners from '$lib/components/sections/Banners.svelte';
	import Handcrafted from '$lib/components/sections/Handcrafted.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import Creds from '$lib/components/sections/Creds.svelte';
	import Testimonials from '$lib/components/sections/Testimonials.svelte';
	import { heroContent } from '$lib/content';
</script>

<Hero hero={heroContent.home} peek={heroContent.oilEdition}>
	{#snippet stage()}
		<HeroStatement
			question={heroContent.home.headline}
			lines={heroContent.home.lines ?? [[heroContent.home.headline]]}
			emphasis={heroContent.home.emphasis}
			answer={heroContent.home.description}
		/>
	{/snippet}
</Hero>
<Handcrafted />
<Gallery />
<Creds />
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
