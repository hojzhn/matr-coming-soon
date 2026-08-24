<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { LegalDocument } from '$lib/content/types';

	let {
		doc,
		open,
		onclose
	}: {
		doc: LegalDocument;
		open: boolean;
		onclose: () => void;
	} = $props();
</script>

<Modal {open} title={doc.title} {onclose}>
	<Heading level={5} tone="muted" class="mb-8">Last updated {doc.last_updated}</Heading>
	{#if doc.intro}
		<div class="flex flex-col gap-3 mb-8">
			{#each doc.intro as paragraph, i (i)}
				<Heading level={4} tag="p" tone="muted">{paragraph}</Heading>
			{/each}
		</div>
	{/if}
	<div class="flex flex-col gap-8">
		{#each doc.sections as section (section.heading)}
			<div>
				<Heading level={4} tag="p" class="mb-2">{section.heading}</Heading>
				<div class="flex flex-col gap-3">
					{#each section.blocks as block, i (i)}
						{#if block.items}
							<ul class="flex flex-col gap-2 pl-5 list-disc">
								{#each block.items as item (item)}
									<li>
										<Heading level={4} tag="span" tone="muted">{item}</Heading>
									</li>
								{/each}
							</ul>
						{:else if block.heading}
							<Heading level={5} tag="p" tone="ink" weight="semibold">{block.heading}</Heading>
						{:else if block.text}
							<Heading level={4} tag="p" tone="muted">{block.text}</Heading>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</Modal>
