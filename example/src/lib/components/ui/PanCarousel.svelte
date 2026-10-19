<script lang="ts">
	import { cn } from '$lib/cn';
	import type { CarouselItem } from '$lib/content/types';

	let {
		items,
		label,
		class: className
	}: {
		items: CarouselItem[];
		label: string;
		class?: string;
	} = $props();

	const idleSpeed = 28;
	const centerSpeed = 4;
	const maxSpeed = 640;
	const deadZone = 0.18;

	let viewportEl = $state<HTMLDivElement>();
	let trackEl = $state<HTMLDivElement>();
	let reduceMotion = $state(false);

	const copies = $derived(reduceMotion ? [0] : [0, 1]);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		function update() {
			reduceMotion = mq.matches;
		}
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	$effect(() => {
		if (reduceMotion || !viewportEl || !trackEl) return;
		const viewport = viewportEl;
		const track = trackEl;

		let offset = 0;
		let speed = idleSpeed;
		let target = idleSpeed;
		let last = performance.now();
		let frame = 0;
		let dragging = false;
		let dragX = 0;

		function apply() {
			const loop = track.scrollWidth / 2;
			if (loop > 0) offset = ((offset % loop) + loop) % loop;
			track.style.transform = `translate3d(${-offset}px, 0, 0)`;
		}

		function tick(now: number) {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (!dragging) {
				speed += (target - speed) * Math.min(1, dt * 6);
				offset += speed * dt;
				apply();
			}
			frame = requestAnimationFrame(tick);
		}

		function onMove(e: PointerEvent) {
			if (e.pointerType === 'mouse') {
				const rect = viewport.getBoundingClientRect();
				const n = ((e.clientX - rect.left) / rect.width) * 2 - 1;
				const m = Math.abs(n);
				target =
					m < deadZone
						? centerSpeed
						: Math.sign(n) * (centerSpeed + ((m - deadZone) / (1 - deadZone)) ** 2 * maxSpeed);
				return;
			}
			if (!dragging) return;
			offset -= e.clientX - dragX;
			dragX = e.clientX;
			apply();
		}

		function onLeave() {
			target = idleSpeed;
		}

		function onDown(e: PointerEvent) {
			if (e.pointerType === 'mouse') return;
			dragging = true;
			dragX = e.clientX;
		}

		function onUp() {
			dragging = false;
			speed = idleSpeed;
			target = idleSpeed;
		}

		viewport.addEventListener('pointermove', onMove);
		viewport.addEventListener('pointerleave', onLeave);
		viewport.addEventListener('pointerdown', onDown);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			viewport.removeEventListener('pointermove', onMove);
			viewport.removeEventListener('pointerleave', onLeave);
			viewport.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
			track.style.transform = '';
		};
	});
</script>

<div
	bind:this={viewportEl}
	role="group"
	aria-label={label}
	class={cn(
		'w-full select-none',
		reduceMotion ? 'no-scrollbar overflow-x-auto' : 'touch-pan-y overflow-hidden',
		className
	)}
>
	<div bind:this={trackEl} class="flex w-max gap-2 will-change-transform">
		{#each copies as copy (copy)}
			{#each items as item, i (item.src)}
				<img
					src={item.src}
					alt={copy === 0 ? item.alt : ''}
					aria-hidden={copy === 0 ? undefined : true}
					width={item.width}
					height={item.height}
					loading={copy === 0 && i < 8 ? 'eager' : 'lazy'}
					decoding="async"
					draggable="false"
					class="h-56 w-auto shrink-0 object-cover md:h-80"
				/>
			{/each}
		{/each}
	</div>
</div>
