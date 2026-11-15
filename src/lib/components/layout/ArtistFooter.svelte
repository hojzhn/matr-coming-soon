<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { siteContent } from '$lib/content';
</script>

<footer class="border-t border-line bg-surface">
	<Container width="full">
		<div class="flex h-14 items-center justify-between gap-4">
			<Heading tag="p" size="xs" tone="muted" balance={false}>Printed in oil at Matr Labs</Heading>
			<a href={siteContent.url} class="transition-opacity hover:opacity-70">
				<Heading tag="span" size="xs" weight="semibold" balance={false}>matr.art</Heading>
			</a>
		</div>
	</Container>
</footer>
