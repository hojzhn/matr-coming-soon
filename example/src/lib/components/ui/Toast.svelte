<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import Heading from './Heading.svelte';
	import Icon from './Icon.svelte';
	import { toast } from '$lib/toast/toast.svelte';
</script>

<div class="pointer-events-none fixed inset-x-0 top-20 z-[70] flex flex-col items-center gap-2 px-container md:top-24">
	{#each toast.messages as message (message.id)}
		<div
			class="pointer-events-auto flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-lg"
			in:fly={{ y: -12, duration: 200 }}
			out:fade={{ duration: 150 }}
		>
			<Icon name="cart" class="h-4 w-4 shrink-0 text-ink" />
			<Heading level={5} tag="span" weight="medium" tone="ink">{message.text}</Heading>
			<button
				type="button"
				aria-label="Dismiss"
				onclick={() => toast.dismiss(message.id)}
				class="text-ink-faint transition-colors hover:text-ink"
			>
				<Icon name="close" class="h-3.5 w-3.5" />
			</button>
		</div>
	{/each}
</div>
