<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import OrderForm from './OrderForm.svelte';
	import CartPanel from './CartPanel.svelte';
	import Strengths from './Strengths.svelte';

	let { formToken }: { formToken: string } = $props();
</script>

<Section id="order" tone="surface" contained={false} fullHeight>
	<Container>
		<OrderForm />
		<CartPanel {formToken} />
	</Container>


		<Strengths />
</Section>
