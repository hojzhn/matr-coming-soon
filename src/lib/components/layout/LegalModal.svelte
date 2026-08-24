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
	<Heading level={5} tone="muted" class="mb-8">Last updated {doc.updated}</Heading>
	<div class="flex flex-col gap-8">
		{#each doc.sections as section (section.heading)}
			<div>
				<Heading level={4} tag="p" class="mb-2">{section.heading}</Heading>
				<Heading level={4} tag="p" tone="muted">{section.body}</Heading>
			</div>
		{/each}
	</div>
</Modal>
