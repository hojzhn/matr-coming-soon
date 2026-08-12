<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
		import Container from '$lib/components/ui/Container.svelte';

	import { strengthsContent } from '$lib/content';

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
	<div class="relative my-16 aspect-square md:aspect-video w-full bg-gray-400 md:my-24">
		<div class="absolute inset-0 flex items-center justify-center">
			<Heading level={5} tag="p" eyebrow uppercase>
				Image placeholder
			</Heading>
		</div>
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
		<div class="relative aspect-square w-full bg-gray-400 md:aspect-video">
			<div class="absolute inset-0 flex items-center justify-center">
				<Heading level={5} tag="p" eyebrow uppercase>
					Image placeholder
				</Heading>
			</div>
		</div>
</Container>
		<div class="mt-3 grid grid-cols-2 gap-1 md:mt-0 md:block md:gap-0">
			<div
				class="relative aspect-4/5 w-full border border-line bg-gray-300 md:absolute md:left-12 md:top-[10%] md:w-[50%] md:max-w-120"
		
			>
				<div class="absolute inset-0 flex items-center justify-center">
					<Heading
						level={5}
						tag="p"
						eyebrow
						uppercase
						align="center"
						leading="snug"
						class="w-full px-1"
					>
						Image placeholder
					</Heading>
				</div>
			</div>

			<div
				class="relative aspect-2/3 w-full border border-line bg-gray-300 md:absolute md:right-[12vw] md:bottom-0 md:w-[20%] md:max-w-64"
			
			>
				<div class="absolute inset-0 flex items-center justify-center">
					<Heading
						level={5}
						tag="p"
						eyebrow
						uppercase
						align="center"
						leading="snug"
						class="w-full px-1"
					>
						Image placeholder
					</Heading>
				</div>
			</div>
		</div>
	</div>

	<Container>
<div class="mt-4">
	<Heading level={2} size="2xl">{strengthsContent.process.heading}</Heading>
	<div class="flex flex-col items-start md:items-end gap-8 mt-16 md:flex-row md:ml-50">
	<div class="aspect-2/3 w-40 shrink-0 bg-gray-400 sm:w-56 md:w-100"></div>

	<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} >
		{strengthsContent.process.body}
	</Heading>
		</div>
</div>
</Container>