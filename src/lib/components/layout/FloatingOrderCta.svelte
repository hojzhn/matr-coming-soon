<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { cn } from '$lib/cn';
	import { fly } from 'svelte/transition';

	let pastHero = $state(false);

	$effect(() => {
		const hero = document.getElementById('top');
		if (!hero) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				pastHero = !entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		observer.observe(hero);
		return () => observer.disconnect();
	});
</script>

<div class="fixed bottom-6 right-6 z-40">
	{#key pastHero}
		<a
			href={pastHero ? '#top' : '#order'}
			in:fly={{ y: 16, duration: 280, delay: 150 }}
			out:fly={{ y: -16, duration: 150 }}
			class="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-surface shadow-xl transition-colors hover:bg-canvas-from"
		>
			<Heading level={4} tag="span" size="sm" weight="medium" leading="none">
				{pastHero ? 'Top' : 'See the print'}
			</Heading>
			<Icon name="arrow-right" class={cn('h-4 w-4 shrink-0 transition-transform', pastHero && '-rotate-90')} />
		</a>
	{/key}
</div>
