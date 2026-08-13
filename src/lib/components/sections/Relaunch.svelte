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
	<div class="flex flex-col gap-6 xl:flex-row xl:items-end lg:justify-between relative xl:-mt-120">
	<div class="flex flex-col xl:flex-row xl:items-end gap-12">
	<div class="relative aspect-video overflow-hidden xl:aspect-4/5 xl:h-160">
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
		<Heading
			level={4}
			tag="p"
			size="base"
			sizeMd="lg"
			weight="medium"
			tracking="tight"
			tone="ink"
			class="md:max-w-2xl"
		>
			{relaunchContent.text}
		</Heading>
		</div>
		<div class="flex items-center gap-3">
			{#each links as link (link.label)}
				<a
					href={link.href}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noreferrer' : undefined}
					aria-label={link.label}
					class="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
				>
					<Icon name={link.icon} class="h-4.5 w-4.5 text-ink-muted transition-colors group-hover:text-brand" />
				</a>
			{/each}
		</div>

	
	</div>
</Section>
