<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { trackEvent } from '$lib/analytics/track';
</script>

<div class="fixed bottom-6 right-6 z-40">
	<a
		href="#order"
		aria-label="Order print"
		onclick={() => trackEvent('floating_cta_click')}
		class="flex items-center justify-center rounded-full bg-brand p-3 text-ink shadow-xl transition-colors hover:bg-brand-accent"
	>
		<Icon name="palette" class="h-6 w-6 shrink-0" />
	</a>
</div>
