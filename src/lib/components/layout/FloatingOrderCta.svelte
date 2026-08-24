<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
</script>

<div class="fixed bottom-6 right-6 z-40">
	<a
		href="#order"
		class="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-surface shadow-xl transition-colors hover:bg-canvas-from"
	>
		<Heading level={5} tag="span" weight="medium" leading="none">Order print</Heading>
		<Icon name="arrow-right" class="h-4 w-4 shrink-0" />
	</a>
</div>
