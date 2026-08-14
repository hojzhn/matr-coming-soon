<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import OrderForm from './OrderForm.svelte';
	import Strengths from './Strengths.svelte';

	let { formToken }: { formToken: string } = $props();
</script>

<Section id="order" tone="surface" contained={false} fullHeight>
	<Container>
		<OrderForm {formToken} />
	</Container>

	<Strengths />
</Section>
