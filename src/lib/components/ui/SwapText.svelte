<script lang="ts">
	import { fly } from 'svelte/transition';

	let { text }: { text: string } = $props();
</script>

<span class="inline-grid" aria-hidden="true">
	{#key text}
		<span class="col-start-1 row-start-1 whitespace-nowrap" out:fly={{ y: -12, duration: 180 }}>
			{#each [...text] as char, ci (ci)}
				<span class="swap-letter inline-block" style={`animation-delay: ${120 + ci * 30}ms`}
					>{#if char === ' '}&nbsp;{:else}{char}{/if}</span
				>
			{/each}
		</span>
	{/key}
</span>

<style>
	.swap-letter {
		animation: swap-letter-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes swap-letter-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.swap-letter {
			animation: none;
		}
	}
</style>
