<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import DitherBackdrop from '$lib/components/ui/DitherBackdrop.svelte';
	import { contactContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';

	const { banner } = contactContent;

	let hovered = $state(false);
</script>

<Section tone="surface" contained={false} class="py-0">
	<a
		href={banner.href}
		onclick={() => trackEvent('contact_banner_click')}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		onfocus={() => (hovered = true)}
		onblur={() => (hovered = false)}
		class="group block border-t-2 border-ink"
	>
		<div class="px-container py-6 md:py-10">
			<Heading level={2} size="2xl" leading="none" tracking="tighter" balance={false}>
				{banner.heading}
			</Heading>
		</div>
		<div class="grid border-t-2 border-ink md:grid-cols-12">
			<div class="px-container py-6 md:col-span-7 md:border-r-2 md:border-ink">
				<Heading level={4} tag="p" weight="medium" balance={false} class="max-w-2xl">{banner.body}</Heading>
			</div>
			<div class="relative overflow-hidden border-t-2 border-ink md:col-span-5 md:border-t-0">
				<DitherBackdrop active={hovered} />
				<div class="relative flex h-full items-center justify-between gap-4 px-container py-4 md:px-8">
					<Heading level={4} tag="span" size="md" sizeMd="lg" tone={hovered ? 'surface' : 'ink'} class="transition-colors duration-300">{banner.cta}</Heading>
					<Icon
						name="arrow-right"
						class={cn(
							'h-6 w-6 shrink-0 transition-[color,transform] duration-300 ease-out group-hover:translate-x-2 md:h-7 md:w-7',
							hovered ? 'text-surface' : 'text-ink'
						)}
					/>
				</div>
			</div>
		</div>
	</a>
</Section>
