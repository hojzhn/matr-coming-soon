<script lang="ts">
	import type { Snippet } from 'svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	let { heading, children }: { heading: string; children: Snippet } = $props();
</script>

<div>
	<Heading level={3} eyebrow uppercase>
		{heading}
	</Heading>
	<div class="mt-6">
		{@render children()}
	</div>
</div>
