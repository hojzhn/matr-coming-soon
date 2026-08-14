<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Heading from './Heading.svelte';

	let {
		label,
		description,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		required = false,
		autocomplete,
		error = '',
		onblur,
		children
	}: {
		label: string;
		description?: string;
		value?: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'tel';
		placeholder?: string;
		required?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		error?: string;
		onblur?: (e: FocusEvent) => void;
		children?: Snippet;
	} = $props();
</script>

<svelte:element this={children ? 'div' : 'label'} class="block mb-4">
	<Heading level={5} tag="span" tone="muted" class="block">{label}{required ? ' *' : ''}</Heading>
	{#if description}
		<Heading level={5} tag="p" size="xs" tone="muted" class="mt-2 mb-3">{description}</Heading>
	{/if}
	{#if children}
		{@render children()}
	{:else}
		<input
			{type}
			{placeholder}
			{autocomplete}
			{value}
			oninput={(e) => (value = e.currentTarget.value)}
			{onblur}
			class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
		/>
	{/if}
	{#if error}
		<span class="mt-1 block text-xs text-danger">{error}</span>
	{/if}
</svelte:element>
