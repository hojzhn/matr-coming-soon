<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
		import Container from '$lib/components/ui/Container.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';

	import { strengthsContent } from '$lib/content';
  import ArrowLink from '../ui/ArrowLink.svelte';

	const detailSrc = '/images/strengths/detail.webp';
	const strengthMiddleSrc = '/images/strengths/strength-middle.webp';
	const strengthSideSrc = '/images/strengths/strength-side.webp';
	const strengthSide2Src = '/images/strengths/strength-side-2.webp';
	const craftedSrc = '/images/strengths/crafted.webp';

	let processImageEl = $state<HTMLElement>();
	let scrollY = $state(0);
	let reduceMotion = $state(false);

	const processImageProgress = $derived.by(() => {
		scrollY;
		if (!processImageEl || reduceMotion) return 0.5;
		const rect = processImageEl.getBoundingClientRect();
		const vh = window.innerHeight;
		const total = rect.height + vh;
		return Math.min(1, Math.max(0, (vh - rect.top) / total));
	});

	$effect(() => {
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let ticking = false;
		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				scrollY = window.scrollY;
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => window.removeEventListener('scroll', onScroll);
	});

	let isDesktop = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		function update() {
			isDesktop = mq.matches;
		}
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	let isXl = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 1280px)');
		function update() {
			isXl = mq.matches;
		}
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	const sideParallaxSpeed = 280;
	const leftSideParallax = $derived((processImageProgress - 0.5) * -sideParallaxSpeed);
	const rightSideParallax = $derived((processImageProgress - 0.5) * sideParallaxSpeed);
</script>


<Container>
	<div class="relative my-16 aspect-square md:aspect-video w-full md:my-24">
		<LazyImage src={detailSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
	</div>

<div>
	<Heading level={1}>{strengthsContent.heading}</Heading>
	<Heading level={3} tag="p"  weight="medium" balance={false} class="mt-4 max-w-3xl">
		{strengthsContent.intro}
	</Heading>
</div>

<div class="mt-12 grid gap-12 sm:grid-cols-3">
	{#each strengthsContent.items as item, i (i)}
		<div>
			<Icon name={item.icon as 'droplet' | 'layers' | 'hand'} class="h-7 w-7 text-brand" strokeWidth={1.5} />
			<Heading level={4} class="mt-4" size="md">{item.title}</Heading>
			<div class="mt-2 flex flex-col gap-3">
				{#each item.body.split('\n').filter(Boolean) as paragraph, pi (pi)}
					<Heading level={4} tag="p" weight="medium" tone="muted">{@html paragraph}</Heading>
				{/each}
			</div>
		</div>
	{/each}
</div>
</Container>


	<div bind:this={processImageEl} class="relative my-16 md:my-24">
	<Container>
		<div class="relative aspect-square w-full md:aspect-4/3">
			<LazyImage src={strengthMiddleSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
		</div>
</Container>
		<div class="mt-3 grid grid-cols-2 gap-1 xl:mt-0 xl:block xl:gap-0">
			<div
				class="relative aspect-5/4 xl:aspect-2/3 w-full  xl:absolute xl:left-8 xl:top-[10%] xl:w-[calc(96vw_-_calc(var(--container-max)_+_48px))] xl:min-w-80 xl:max-w-100"
				style="transform: translateY({isXl ? leftSideParallax : 0}px)"
			>
				<LazyImage src={strengthSideSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
			</div>

			<div
				class="relative aspect-5/4 xl:aspect-2/3 w-full xl:absolute xl:right-8 xl:-bottom-12 xl:w-[calc(96vw_-_calc(var(--container-max)_+_48px))] xl:min-w-80 xl:max-w-100"
				style="transform: translateY({isXl ? rightSideParallax : 0}px)"
			>
				<LazyImage src={strengthSide2Src} alt="" class="absolute inset-0 h-full w-full object-cover" />
			</div>
		</div>
	</div>

	<Container>
<div class="mt-4">
	<Heading level={1}>{strengthsContent.process.heading}</Heading>
	<div class="flex flex-col items-start lg:items-end gap-8 mt-16 lg:flex-row xl:ml-50">
	<div class="relative aspect-2/3 w-60 shrink-0 sm:w-56 lg:w-100">
		<LazyImage src={craftedSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
	</div>

	<div>
	<Heading level={3} tag="p"  weight="medium" balance={false}>
		{strengthsContent.process.body}
	</Heading>
	<ArrowLink href="/#contact" label="Contact us" size="sm" sizeMd="md" arrow={false} class="mt-4 lg:mt-12 border-2 px-6 py-3" /></div>
		</div>
</div>
</Container>