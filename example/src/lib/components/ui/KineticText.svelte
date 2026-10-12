<script lang="ts">
	let {
		text,
		baseWeight = 500,
		peakWeight = 900,
		peakColor
	}: {
		text: string;
		baseWeight?: number;
		peakWeight?: number;
		peakColor?: string;
	} = $props();

	const words = $derived(text.split(' '));

	const sweepMs = 2600;
	const pauseMs = 4200;

	let rootEl = $state<HTMLSpanElement>();

	$effect(() => {
		if (!rootEl) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const root = rootEl;
		const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-letter]'));
		let frame = 0;
		let visible = true;
		let pointerX: number | null = null;
		let center = -1;
		let start = performance.now();

		function tick(now: number) {
			frame = 0;
			const rect = root.getBoundingClientRect();
			const sigma = Math.max(40, rect.width * 0.09);
			let target: number;

			if (pointerX !== null) {
				target = pointerX - rect.left;
			} else {
				const t = ((now - start) % (sweepMs + pauseMs)) / sweepMs;
				target = t <= 1 ? -2 * sigma + t * (rect.width + 4 * sigma) : -1e6;
			}

			center = target < -1e5 || center < -1e5 ? target : center + (target - center) * 0.18;

			for (const letter of letters) {
				const x = letter.offsetLeft + letter.offsetWidth / 2 + (letter.offsetParent === root ? 0 : (letter.offsetParent as HTMLElement).offsetLeft);
				const d = (x - center) / sigma;
				const k = center < -1e5 ? 0 : Math.exp(-d * d);
				letter.style.fontWeight = String(Math.round(baseWeight + (peakWeight - baseWeight) * k));
				if (peakColor) {
					letter.style.color =
						k > 0.01 ? `color-mix(in oklab, ${peakColor} ${Math.round(k * 100)}%, currentColor)` : '';
				}
			}

			if (visible) frame = requestAnimationFrame(tick);
		}

		function onMove(e: PointerEvent) {
			if (e.pointerType !== 'mouse') return;
			pointerX = e.clientX;
		}

		function onLeave() {
			pointerX = null;
			start = performance.now() - sweepMs;
		}

		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible && !frame) frame = requestAnimationFrame(tick);
		});

		observer.observe(root);
		root.addEventListener('pointermove', onMove);
		root.addEventListener('pointerleave', onLeave);
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			root.removeEventListener('pointermove', onMove);
			root.removeEventListener('pointerleave', onLeave);
			for (const letter of letters) {
				letter.style.fontWeight = '';
				letter.style.color = '';
			}
		};
	});
</script>

<span bind:this={rootEl} class="relative inline-block py-3">
	<span class="sr-only">{text}</span>
	{#each words as word, w (w)}
		<span aria-hidden="true" class="relative inline-block whitespace-nowrap">
			{#each word.split('') as letter, l (l)}<span data-letter class="inline-block">{letter}</span>{/each}
		</span>{w < words.length - 1 ? ' ' : ''}
	{/each}
</span>
