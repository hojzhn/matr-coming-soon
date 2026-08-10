<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import OrderForm from './OrderForm.svelte';
	import Strengths from './Strengths.svelte';

	let { formToken }: { formToken: string } = $props();
</script>

<Section id="order" tone="surface" contained={false} fullHeight>
	<Container>
		<OrderForm {formToken} />
	</Container>

	<Container>
	<div class="relative my-16 aspect-square md:aspect-video w-full bg-fill-soft md:my-24">
		<div class="absolute inset-0 flex items-center justify-center">
			<Heading level={5} tag="p" eyebrow uppercase>
				Image placeholder
			</Heading>
		</div>
	</div>
</Container>
	<Container>
		<Strengths />
	</Container>
</Section>
