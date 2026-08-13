<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
		import Container from '$lib/components/ui/Container.svelte';

	import { strengthsContent } from '$lib/content';

	const detailSrc = '/images/strengths/detail.jpg';
	const strengthMiddleSrc = '/images/strengths/strength-middle.jpg';
	const strengthSideSrc = '/images/strengths/strength-side.jpg';
	const strengthSide2Src = '/images/strengths/strength-side-2.jpg';
	const craftedSrc = '/images/strengths/crafted.jpg';

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
</script>


<Container>
	<div class="relative my-16 aspect-square md:aspect-video w-full md:my-24">
		<img src={detailSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
	</div>

<div>
	<Heading level={2} size="2xl">{strengthsContent.heading}</Heading>
	<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} class="mt-4 max-w-3xl">
		{strengthsContent.intro}
	</Heading>
</div>

<div class="mt-12 grid gap-8 sm:grid-cols-3">
	{#each strengthsContent.items as item (item.title)}
		<div>
			<Icon name={item.icon as 'texture' | 'droplet' | 'layers'} class="h-7 w-7 text-brand" strokeWidth={1.5} />
			<Heading level={3} size="sm" sizeMd="md" class="mt-4">{item.title}</Heading>
			<Heading level={4} tag="p" size="sm" sizeMd="md" weight="medium" tone="muted" class="mt-2">{item.body}</Heading>
		</div>
	{/each}
</div>
</Container>


	<div bind:this={processImageEl} class="relative my-16 md:my-24">
	<Container>
		<div class="relative aspect-square w-full md:aspect-4/3">
			<img src={strengthMiddleSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
		</div>
</Container>
		<div class="mt-3 grid grid-cols-2 gap-1 md:mt-0 md:block md:gap-0">
			<div
				class="relative aspect-4/5 w-full  md:absolute md:left-[calc(5vw_-_2rem)] md:top-[10%] md:w-[24%] md:max-w-120"
			>
				<img src={strengthSideSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
			</div>

			<div
				class="relative aspect-4/5 md:aspect-2/3 w-full md:absolute md:right-[calc(5vw_-_2rem)] md:-bottom-12 md:w-[22%] md:max-w-120"
			>
				<img src={strengthSide2Src} alt="" class="absolute inset-0 h-full w-full object-cover" />
			</div>
		</div>
	</div>

	<Container>
<div class="mt-4">
	<Heading level={2} size="2xl">{strengthsContent.process.heading}</Heading>
	<div class="flex flex-col items-start lg:items-end gap-8 mt-16 lg:flex-row xl:ml-50">
	<div class="relative aspect-2/3 w-60 shrink-0 sm:w-56 lg:w-100">
		<img src={craftedSrc} alt="" class="absolute inset-0 h-full w-full object-cover" />
	</div>

	<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} >
		{strengthsContent.process.body}
	</Heading>
		</div>
</div>
</Container>