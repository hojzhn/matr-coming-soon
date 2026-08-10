<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { strengthsContent } from '$lib/content';
</script>

<div class="max-w-2xl">
	<Heading level={2} size="2xl">{strengthsContent.heading}</Heading>
	<Heading level={3} tag="p" size="sm" sizeMd="md" weight="normal" tone="muted" class="mt-4">
		{strengthsContent.intro}
	</Heading>
</div>

<div class="mt-12 grid gap-8 sm:grid-cols-3">
	{#each strengthsContent.items as item (item.title)}
		<div>
			<Icon name={item.icon as 'texture' | 'droplet' | 'layers'} class="h-7 w-7 text-brand" strokeWidth={1.5} />
			<Heading level={3} size="sm" sizeMd="md" class="mt-4">{item.title}</Heading>
			<Heading level={4} tag="p" size="xs" sizeMd="sm" weight="normal" tone="muted" class="mt-2">{item.body}</Heading>
		</div>
	{/each}
</div>
