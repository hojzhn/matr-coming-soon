<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { testimonialsContent } from '$lib/content';
	import { loadInstagramEmbeds, loadTwitterEmbeds } from '$lib/embeds';

	const platformLabel = { instagram: 'Instagram', twitter: 'X / Twitter' } as const;

	const INSTAGRAM_POST_RE = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[^/?#]+/i;
	const TWEET_RE = /^https?:\/\/(www\.)?(twitter|x)\.com\/[^/]+\/status\/\d+/i;

	function isEmbeddable(platform: string, href: string): boolean {
		return platform === 'instagram' ? INSTAGRAM_POST_RE.test(href) : TWEET_RE.test(href);
	}

	$effect(() => {
		testimonialsContent.posts;
		loadInstagramEmbeds();
		loadTwitterEmbeds();
	});

	let scrollerEl = $state<HTMLDivElement>();

	function scrollByCard(direction: 1 | -1) {
		if (!scrollerEl) return;
		const card = scrollerEl.querySelector<HTMLElement>(':scope > *');
		const gap = 16;
		const amount = card ? card.getBoundingClientRect().width + gap : 320;
		scrollerEl.scrollBy({ left: direction * amount, behavior: 'smooth' });
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollByCard(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollByCard(-1);
		}
	}
</script>

<Section id="testimonials" tone="surface" contained={false}>
	<Container class="mb-4 flex items-center justify-between gap-2">
	<Heading level={4}>Meet our clients</Heading>
	<div class="flex items-center gap-2">

		<button
			type="button"
			aria-label="Scroll left"
			onclick={() => scrollByCard(-1)}
			class="flex h-9 w-9 items-center justify-center border border-line transition-colors hover:border-ink"
		>
			<Icon name="arrow-right" class="h-4 w-4 rotate-180" />
		</button>
		<button
			type="button"
			aria-label="Scroll right"
			onclick={() => scrollByCard(1)}
			class="flex h-9 w-9 items-center justify-center border border-line transition-colors hover:border-ink"
		>
			<Icon name="arrow-right" class="h-4 w-4" />
		</button>
		</div>
	</Container>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={scrollerEl}
		class="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto px-container pb-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
		tabindex="0"
		aria-label={testimonialsContent.postsLabel}
		onkeydown={onKeydown}
	>
		{#each testimonialsContent.posts as post, i (i)}
			{@const platform = post.platform as 'instagram' | 'twitter'}
			{#if isEmbeddable(platform, post.href)}
				<div class="w-81.5 shrink-0 snap-start overflow-hidden">
					{#if platform === 'instagram'}
						<blockquote
							class="instagram-media"
							data-instgrm-permalink={post.href}
							data-instgrm-version="14"
							style="margin:0; width:100%;"
						></blockquote>
					{:else}
						<blockquote class="twitter-tweet">
							<a href={post.href}>{post.href}</a>
						</blockquote>
					{/if}
				</div>
			{:else}
				<a
					href={post.href}
					target="_blank"
					rel="noreferrer"
					class="group flex aspect-square w-[75vw] shrink-0 snap-start flex-col items-center justify-center gap-3 border border-line bg-surface transition-colors hover:border-ink sm:w-[46vw] md:w-[30vw] lg:w-[23vw]"
				>
					<Icon
						name={platform}
						class="h-8 w-8 text-ink-muted transition-colors group-hover:text-brand"
					/>
					<Heading level={5} tag="span" tone="muted">
						View on {platformLabel[platform]}
					</Heading>
				</a>
			{/if}
		{/each}
	</div>


</Section>
