<script lang="ts">
	import Heading from './Heading.svelte';
	import { orderContent } from '$lib/content';
</script>

<div class="mt-3 flex items-center gap-4 border border-line bg-fill-soft/60 p-4">
	<svg viewBox="0 0 140 100" class="h-20 w-28 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="80" y="30" width="50" height="50" class="fill-fill-soft stroke-ink-faint" stroke-width="1.5" />
		<path d="M10 30 H80" class="stroke-ink" stroke-width="6" stroke-linecap="round" />
		<path d="M80 30 V46" class="stroke-brand" stroke-width="6" stroke-linecap="round" />
		<path d="M80 46 V80 H60" class="stroke-ink-faint" stroke-width="6" stroke-linecap="round" />
	</svg>

	<div class="flex flex-col gap-1.5">
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 shrink-0 rounded-full bg-ink"></span>
			<Heading level={6} tag="span" tone="muted">{orderContent.form.stretchDiagramArtworkLabel}</Heading>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 shrink-0 rounded-full bg-brand"></span>
			<Heading level={6} tag="span" tone="muted">{orderContent.form.stretchDiagramOutpaintLabel}</Heading>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 shrink-0 rounded-full bg-ink-faint"></span>
			<Heading level={6} tag="span" tone="muted">{orderContent.form.stretchDiagramMarginLabel}</Heading>
		</div>
	</div>
</div>
