<script lang="ts">
	import Heading from './Heading.svelte';

	let {
		label,
		width = $bindable(''),
		height = $bindable(''),
		unit = $bindable('in')
	}: { label?: string; width?: string; height?: string; unit?: 'cm' | 'in' } = $props();

	function setUnit(u: 'cm' | 'in') {
		unit = u;
	}

	const fieldClass =
		'w-full min-w-0 border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
</script>

<div>
	{#if label}
		<Heading level={5} tag="p" eyebrow class="mb-1.5">{label}</Heading>
	{/if}
	<div class="flex items-end gap-3">
		<input
			type="number"
			min="0"
			inputmode="decimal"
			placeholder="W"
			aria-label="Width"
			bind:value={width}
			class={fieldClass}
		/>
		<span class="shrink-0 pb-2.5 text-sm text-ink-faint">×</span>
		<input
			type="number"
			min="0"
			inputmode="decimal"
			placeholder="H"
			aria-label="Height"
			bind:value={height}
			class={fieldClass}
		/>

		<div class="relative flex shrink-0 rounded-full border-2 border-ink p-1" role="group" aria-label="Unit">
			<div
				class="absolute inset-y-1 left-1 w-10 rounded-full bg-ink transition-transform duration-200 ease-out"
				style="transform: translateX({unit === 'in' ? '0' : '100%'})"
			></div>
			{#each ['in', 'cm'] as const as u}
				<button
					type="button"
					onclick={() => setUnit(u)}
					aria-pressed={unit === u}
					class="relative z-10 w-10 py-1.5 text-sm font-medium transition-colors {unit === u
						? 'text-surface'
						: 'text-ink hover:text-ink-muted'}"
				>
					{u}
				</button>
			{/each}
		</div>
	</div>
</div>
