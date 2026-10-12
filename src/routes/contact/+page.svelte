<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Contact from '$lib/components/sections/Contact.svelte';
	import { heroContent } from '$lib/content';

	let { data } = $props();
</script>

<Hero hero={heroContent.contact} />
<Contact formToken={data.formToken} />
