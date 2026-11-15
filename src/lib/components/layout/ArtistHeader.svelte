<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { siteContent } from '$lib/content';
</script>

<header class="border-b border-line bg-surface">
	<Container width="full">
		<div class="flex h-10 items-center justify-between">
			<a href={siteContent.url} class="flex items-end gap-1.5 text-ink transition-opacity hover:opacity-70" aria-label="matr labs, main site">
				<Logo class="h-4 w-auto" />
				<Heading tag="span" size="sm" weight="bold" leading="none" tracking="tighter" balance={false} class="whitespace-nowrap">matr labs</Heading>
			</a>
			<Heading tag="span" size="xs" tone="muted" uppercase balance={false}>Studio Plus</Heading>
		</div>
	</Container>
</header>
