<script lang="ts">
	import { DitherFill } from '$lib/dither';
	import { cn } from '$lib/cn';

	let { active = false, class: className }: { active?: boolean; class?: string } = $props();

	let canvasEl = $state<HTMLCanvasElement | undefined>();
	let dither = $state<DitherFill | null>(null);

	$effect(() => {
		if (!canvasEl) return;
		const color = getComputedStyle(canvasEl).color;
		const m = color.match(/\d+(?:\.\d+)?/g);
		const rgb: [number, number, number] = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
		const instance = new DitherFill(canvasEl, { px: 1, soft: 0.6, color: rgb });
		dither = instance;
		return () => {
			instance.destroy();
			dither = null;
		};
	});

	$effect(() => {
		dither?.animateTo(active ? 1 : 0, active ? 300 : 240);
	});
</script>

<canvas
	bind:this={canvasEl}
	aria-hidden="true"
	class={cn('pointer-events-none absolute inset-0 h-full w-full text-ink [image-rendering:pixelated]', className)}
></canvas>
