<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Heading from './Heading.svelte';

	let {
		label,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		required = false,
		autocomplete,
		error = '',
		onblur
	}: {
		label: string;
		value?: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'tel';
		placeholder?: string;
		required?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		error?: string;
		onblur?: (e: FocusEvent) => void;
	} = $props();
</script>

<label class="block">
	<Heading level={5} tag="span" eyebrow uppercase class="mb-1.5 block">{label}</Heading>
	<input
		{type}
		{placeholder}
		{required}
		{autocomplete}
		{value}
		oninput={(e) => (value = e.currentTarget.value)}
		{onblur}
		class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
	/>
	{#if error}
		<span class="mt-1 block text-xs text-danger">{error}</span>
	{/if}
</label>
