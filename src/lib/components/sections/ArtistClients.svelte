<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import LoopVideo from '$lib/components/ui/LoopVideo.svelte';
	import { artistsContent } from '$lib/content';
	import type { ArtistClient } from '$lib/content/types';
	import { cn } from '$lib/cn';

	const items: ArtistClient[] = artistsContent.items;
	const pictured = items.filter((item) => item.image);

	let active = $state(pictured[0].name);
	let paused = $state(false);
	let sectionEl = $state<HTMLElement>();

	const activeItem = $derived(pictured.find((item) => item.name === active) ?? pictured[0]);

	function select(name: string) {
		active = name;
	}

	$effect(() => {
		if (!sectionEl || paused) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let visible = false;
		let timer: ReturnType<typeof setTimeout>;
		const current = active;
		const dwell = activeItem.video ? 4000 : 3500;

		const advance = () => {
			if (!visible) {
				timer = setTimeout(advance, 500);
				return;
			}
			const i = pictured.findIndex((item) => item.name === current);
			active = pictured[(i + 1) % pictured.length].name;
		};

		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.3 });
		observer.observe(sectionEl);
		timer = setTimeout(advance, dwell);

		return () => {
			observer.disconnect();
			clearTimeout(timer);
		};
	});
</script>

<div bind:this={sectionEl}>
	<Section id="artists" tone="surface">
		<div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
			<div
				class="lg:col-span-7 lg:order-last"
				role="group"
				onmouseenter={() => (paused = true)}
				onmouseleave={() => (paused = false)}
				onfocusin={() => (paused = true)}
				onfocusout={() => (paused = false)}
			>
				<Heading level={6} tag="p" eyebrow uppercase>{artistsContent.eyebrow}</Heading>
				<Heading level={2} size="lg" sizeMd="xl" weight="medium" class="mt-4">{artistsContent.heading}</Heading>
				<ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 md:gap-x-6">
					{#each items as item (item.name)}
						<li>
							{#if item.image}
								<button
									type="button"
									onmouseenter={() => select(item.name)}
									onfocus={() => select(item.name)}
									onclick={() => select(item.name)}
									aria-pressed={active === item.name}
								>
									<Heading
										level={3}
										tag="span"
										size="lg"
										sizeMd="xl"
										tone={active === item.name ? 'ink' : 'muted'}
										balance={false}
										underline={active === item.name}
										class="transition-colors duration-300"
									>
										{item.name}
									</Heading>
								</button>
							{:else}
								<Heading level={3} tag="span" size="lg" sizeMd="xl" tone="muted" balance={false}>
									{item.name}
								</Heading>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<div class="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
				<div class="relative aspect-4/3 w-full overflow-hidden bg-fill">
					{#each pictured as item (item.name)}
						<div
							class={cn(
								'absolute inset-0 transition-opacity duration-700',
								active === item.name ? 'opacity-100' : 'opacity-0'
							)}
							aria-hidden={active !== item.name}
						>
							{#if item.video}
								<LoopVideo
									src={item.video}
									poster={item.image ?? ''}
									label={item.alt ?? item.name}
									active={active === item.name}
									class="absolute inset-0 h-full w-full"
								/>
							{:else}
								<LazyImage src={item.image ?? ''} alt={item.alt ?? item.name} class="absolute inset-0 h-full w-full object-cover" />
							{/if}
						</div>
					{/each}
				</div>
				<Heading level={5} tag="p" tone="muted" class="mt-3" balance={false}>
					<span aria-live="polite">{activeItem.name}</span>
				</Heading>
			</div>
		</div>
	</Section>
</div>
