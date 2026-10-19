<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Relaunch from '$lib/components/sections/Relaunch.svelte';
	import OrderSection from '$lib/components/sections/OrderSection.svelte';
	import Faq from '$lib/components/sections/Faq.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { heroContent } from '$lib/content';

	let { data } = $props();
</script>

<Hero hero={heroContent.oilEdition} />
<!-- <Relaunch /> -->
<!-- <LazyImage
	src="/images/dividers/brush-divider-1.webp"
	alt=""
	class="h-10 w-full object-cover md:object-contain md:h-20 md:my-12"
/> -->
<OrderSection formToken={data.formToken} />
<Faq />
