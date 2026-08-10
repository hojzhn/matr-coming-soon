<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>matr labs: Coming Soon</title>
	<meta name="description" content="Oil prints made to order. matr labs is coming back soon." />
</svelte:head>

{@render children()}
