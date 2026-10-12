<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { trackEvent } from '$lib/analytics/track';
	import { lenisState } from '$lib/lenis.svelte';
	import { cn } from '$lib/cn';

	let visible = $state(false);

	$effect(() => {
		function update() {
			visible = window.scrollY > window.innerHeight;
		}
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	function toTop() {
		trackEvent('back_to_top_click');
		if (lenisState.instance) lenisState.instance.scrollTo(0, { duration: 1.2 });
		else window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div
	class={cn(
		'fixed bottom-6 right-6 z-40 transition-[opacity,translate] duration-300 [view-transition-name:back-to-top]',
		visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
	)}
>
	<button
		type="button"
		aria-label="Back to top"
		tabindex={visible ? 0 : -1}
		onclick={toTop}
		class="flex items-center justify-center rounded-full bg-brand p-3 text-ink shadow-xl transition-colors hover:bg-brand-accent"
	>
		<Icon name="arrow-right" class="h-6 w-6 shrink-0 -rotate-90" />
	</button>
</div>
