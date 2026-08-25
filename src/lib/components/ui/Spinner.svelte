<script lang="ts">
	let { class: cls = 'h-4 w-4' }: { class?: string } = $props();
</script>

<svg class="animate-spin {cls}" viewBox="0 0 24 24" fill="none">
	<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" />
	<path
		class="opacity-75"
		fill="currentColor"
		d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
	/>
</svg>
