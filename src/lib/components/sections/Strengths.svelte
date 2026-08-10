<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
		import Container from '$lib/components/ui/Container.svelte';

	import { strengthsContent } from '$lib/content';
</script>


	<div class="relative my-16 aspect-square md:aspect-video w-full bg-gray-400 md:my-24">
		<div class="absolute inset-0 flex items-center justify-center">
			<Heading level={5} tag="p" eyebrow uppercase>
				Image placeholder
			</Heading>
		</div>
	</div>

<div>
	<Heading level={2} size="2xl">{strengthsContent.heading}</Heading>
	<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} class="mt-4 max-w-3xl">
		{strengthsContent.intro}
	</Heading>
</div>

<div class="mt-12 grid gap-8 sm:grid-cols-3">
	{#each strengthsContent.items as item (item.title)}
		<div>
			<Icon name={item.icon as 'texture' | 'droplet' | 'layers'} class="h-7 w-7 text-brand" strokeWidth={1.5} />
			<Heading level={3} size="sm" sizeMd="md" class="mt-4">{item.title}</Heading>
			<Heading level={4} tag="p" size="sm" sizeMd="md" weight="medium" tone="muted" class="mt-2">{item.body}</Heading>
		</div>
	{/each}
</div>

	<div class="relative my-16 aspect-square md:aspect-video w-full bg-gray-400 md:my-24">
		<div class="absolute inset-0 flex items-center justify-center">
			<Heading level={5} tag="p" eyebrow uppercase>
				Image placeholder
			</Heading>
		</div>
	</div>

<div class="mt-4">
	<Heading level={2} size="2xl">{strengthsContent.process.heading}</Heading>
	<div class="flex items-end gap-8 mt-16 md:ml-50">
	<div class="aspect-2/3 w-100 shrink-0 bg-gray-400"></div>

	<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} >
		{strengthsContent.process.body}
	</Heading>
		</div>
</div>