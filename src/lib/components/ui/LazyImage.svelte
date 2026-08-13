<script lang="ts">
	import { cn } from '$lib/cn';

	let {
		src,
		alt,
		loading = 'lazy',
		class: className
	}: {
		src: string;
		alt: string;
		loading?: 'lazy' | 'eager';
		class?: string;
	} = $props();

	let loaded = $state(false);
</script>

<img
	{src}
	{alt}
	{loading}
	decoding="async"
	onload={() => (loaded = true)}
	class={cn(
		'transition-[filter,opacity] duration-700 ease-out',
		loaded ? 'opacity-100 blur-none' : 'opacity-0 blur-lg',
		className
	)}
/>
