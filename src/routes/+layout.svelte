<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>matr labs</title>
	<meta name="description" content="Oil prints made to order. Matr labs is coming back soon." />
</svelte:head>

{@render children()}
