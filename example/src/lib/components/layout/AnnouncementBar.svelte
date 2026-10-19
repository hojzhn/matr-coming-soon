<script lang="ts">
	import { onMount } from 'svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import { announcementContent } from '$lib/content';
	import { announcementState } from './announcement-state.svelte';
	import { cn } from '$lib/cn';

	onMount(() => {
		if (announcementState.dismissed) return;

		let lastY = window.scrollY;
		let skipNext = true;
		function onScroll() {
			const y = window.scrollY;
			if (skipNext) {
				skipNext = false;
			} else {
				announcementState.hiddenByScroll = y > 0 && y > lastY;
			}
			lastY = y;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function close() {
		announcementState.dismissed = true;
		document.cookie = 'announcement-dismissed=1; path=/; max-age=31536000; samesite=lax';
	}
</script>

{#if !announcementState.dismissed}
	<div
		class={cn(
			'fixed inset-x-0 top-0 z-50 h-6 w-full bg-brand transition-transform duration-300 ease-out',
			announcementState.hiddenByScroll && '-translate-y-full'
		)}
	>
		<Container width="full" class="relative flex h-full items-center justify-center">
			<Heading
				level={6}
				tag="p"
				size="xs"
				tone="ink"
				weight="medium"
				leading="none"
				tracking="normal"
				align="center"
				class="announcement-text truncate px-6"
			>
				{@html announcementContent.text}
			</Heading>
			<button
				type="button"
				aria-label="Dismiss announcement"
				onclick={close}
				class="absolute right-0 flex h-5 w-5 items-center justify-center text-ink/70 transition-colors hover:text-ink"
			>
				<Icon name="close" class="h-3 w-3" strokeWidth={2.5} />
			</button>
		</Container>
	</div>
{/if}

<style>
	:global(.announcement-text a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
