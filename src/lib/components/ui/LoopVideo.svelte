<script lang="ts">
	import { cn } from '$lib/cn';

	let {
		src,
		poster,
		label,
		class: className
	}: {
		src: string;
		poster: string;
		label: string;
		class?: string;
	} = $props();

	let videoEl = $state<HTMLVideoElement>();

	$effect(() => {
		if (!videoEl) return;
		const video = videoEl;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					video.play().catch(() => {});
				} else {
					video.pause();
				}
			},
			{ threshold: 0.25 }
		);
		observer.observe(video);
		return () => observer.disconnect();
	});
</script>

<video
	bind:this={videoEl}
	{src}
	{poster}
	aria-label={label}
	muted
	loop
	playsinline
	preload="none"
	class={cn('object-cover', className)}
></video>
