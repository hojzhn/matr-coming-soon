<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import { relaunchContent, siteContent } from '$lib/content';

	const links: { icon: IconName; href: string; label: string; external: boolean }[] = [
		{ icon: 'instagram', href: siteContent.social.instagram, label: 'Instagram', external: true },
		{ icon: 'twitter', href: siteContent.social.twitter, label: 'X / Twitter', external: true },
		{ icon: 'message', href: '#testimonials', label: 'Testimonials', external: false }
	];

	const subheroSrc = '/images/relaunch/subhero.jpg';

	let revealed = $state(false);

	$effect(() => {
		function onScroll() {
			revealed = window.scrollY > window.innerHeight * 0.125;
		}
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<Section tone="surface" width="full" class="py-10 md:py-12">
	<div class="flex flex-col gap-6 xl:flex-row xl:items-end lg:justify-between relative xl:-mt-80">
	<div class="flex flex-col xl:flex-row xl:items-end gap-12 xl:gap-20">
	<div class="relative aspect-video overflow-hidden xl:aspect-3/5 xl:h-160">
		<div
			class="absolute inset-0 transition-all duration-700 ease-out {revealed
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<LazyImage
				src={subheroSrc}
				alt=""
				class="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover"
			/>
		</div>
	</div>
		<div
			class="transition-all duration-700 ease-out {revealed
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
		<div class="flex flex-col gap-6 md:max-w-3xl">
		<Heading level={4} weight="medium">A New Medium for Art</Heading>

			<Heading level={1} tone="ink" class="relaunch-heading">{@html relaunchContent.heading}</Heading>

				<Heading level={3} tag="p" weight="medium" tone="ink">
				{relaunchContent.text}
			</Heading>
		</div>
		</div>
		</div>
	

	
	</div>
</Section>

<style>
	:global(.relaunch-heading a) {
		color: var(--color-brand-accent);
		text-decoration: underline;
		text-decoration-style: dashed;
		text-underline-offset: 4px;
	}
</style>
