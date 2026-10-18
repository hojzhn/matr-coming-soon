<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';

	type Punch = { text: string; accent?: boolean };
	type Placement = { x: number; y: number; k: number };

	let {
		punches,
		taglineLines,
		tagline
	}: {
		punches: Punch[];
		taglineLines: string[];
		tagline: string;
	} = $props();

	const cycles = 3;
	const raster = 1.25;
	const punchMs = 460;
	const punchHoldMs = 620;
	const punchOutMs = 260;
	const lineBeatMs = 380;
	const lineEnterMs = 560;
	const restMs = 4200;
	const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const easeIn = 'cubic-bezier(0.64, 0, 0.78, 0)';

	let stageEl = $state<HTMLDivElement>();
	let punchEls = $state<HTMLSpanElement[]>([]);
	let lineEls = $state<HTMLSpanElement[]>([]);
	let recapEl = $state<HTMLSpanElement>();

	function tf(p: Placement, k = p.k, dy = 0) {
		return `translate(${p.x}px, ${p.y + dy}px) scale(${k})`;
	}

	$effect(() => {
		if (!stageEl || !recapEl) return;
		const stage = stageEl;
		const recap = recapEl;
		const pEls = punchEls.slice(0, punches.length);
		const lEls = lineEls.slice(0, taglineLines.length);
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const blurPx = window.matchMedia('(pointer: coarse)').matches ? 0 : 8;
		const blurred = (px: number) => (blurPx ? { filter: `blur(${px}px)` } : {});

		let punchPlaces: Placement[] = [];
		let linePlaces: Placement[] = [];
		let recapPlace: Placement = { x: 0, y: 0, k: 1 };
		let state: 'empty' | 'final' = 'empty';
		let dirty = false;
		let alive = true;
		let paused = false;
		const running = new Set<Animation>();

		function textOf(el: HTMLElement) {
			return el.firstElementChild as HTMLElement;
		}

		function natural(el: HTMLElement) {
			textOf(el).style.fontSize = '';
			return { w: el.offsetWidth, h: el.offsetHeight, size: parseFloat(getComputedStyle(textOf(el)).fontSize) };
		}

		function sizeTo(el: HTMLElement, px: number) {
			textOf(el).style.fontSize = `${px}px`;
			return { w: el.offsetWidth, h: el.offsetHeight };
		}

		function measure() {
			const box = stage.getBoundingClientRect();
			const width = Math.min(box.width, 1200);
			const height = box.height;

			punchPlaces = pEls.map((el) => {
				const n = natural(el);
				const s = Math.min(width / n.w, (height * 0.42) / n.h);
				const size = sizeTo(el, n.size * s * raster);
				return { x: (box.width - size.w) / 2, y: (height - size.h) / 2, k: 1 / raster };
			});

			const r = { w: recap.offsetWidth, h: recap.offsetHeight };
			const recapScale = Math.min(1, width / r.w);
			const recapSize = { w: r.w * recapScale, h: r.h * recapScale };
			const recapGap = Math.max(14, recapSize.h * 0.7);

			const lines = lEls.map(natural);
			const scales = lines.map((n) => width / n.w);
			const stacked = lines.reduce((sum, n, i) => sum + n.h * scales[i], 0);
			const fit = Math.min(1, (height - recapSize.h - recapGap) / stacked);
			const sizes = lEls.map((el, i) => sizeTo(el, lines[i].size * scales[i] * fit));
			const blockHeight = recapSize.h + recapGap + sizes.reduce((sum, s) => sum + s.h, 0);

			let cursor = (height - blockHeight) / 2;
			recapPlace = { x: (box.width - r.w) / 2, y: cursor - (r.h - recapSize.h) / 2, k: recapScale };
			cursor += recapSize.h + recapGap;
			linePlaces = sizes.map((s) => {
				const p = { x: (box.width - s.w) / 2, y: cursor, k: 1 };
				cursor += s.h;
				return p;
			});
		}

		function refresh() {
			if (!dirty) return;
			dirty = false;
			measure();
		}

		function place(el: HTMLElement, p: Placement, visible: boolean) {
			el.style.transform = tf(p);
			el.style.opacity = visible ? '1' : '0';
			el.style.filter = 'none';
		}

		function show(which: typeof state) {
			state = which;
			pEls.forEach((el, i) => place(el, punchPlaces[i], false));
			place(recap, recapPlace, which === 'final');
			lEls.forEach((el, i) => place(el, linePlaces[i], which === 'final'));
		}

		function anim(el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
			const a = el.animate(keyframes, { fill: 'both', ...options });
			const end = Object.entries(keyframes[keyframes.length - 1]).filter(
				([key]) => key !== 'offset' && key !== 'easing' && key !== 'composite'
			);
			running.add(a);
			if (paused) a.pause();
			return a.finished
				.then(() => {
					if (!alive) return;
					end.forEach(([key, value]) => el.style.setProperty(key, String(value)));
					a.cancel();
				})
				.catch(() => {})
				.finally(() => running.delete(a));
		}

		function wait(ms: number) {
			return new Promise<void>((resolve) => {
				let left = ms;
				let last = performance.now();
				function step(now: number) {
					if (!alive) return resolve();
					if (!paused) left -= now - last;
					last = now;
					if (left <= 0) return resolve();
					requestAnimationFrame(step);
				}
				requestAnimationFrame(step);
			});
		}

		function punchIn(el: HTMLElement, p: Placement) {
			return anim(
				el,
				[
					{ transform: tf(p, 1), opacity: 0 },
					{ transform: tf(p, p.k * 0.94), opacity: 1, offset: 0.55 },
					{ transform: tf(p, p.k * 1.02), opacity: 1, offset: 0.8 },
					{ transform: tf(p), opacity: 1 }
				],
				{ duration: punchMs, easing: easeOut }
			);
		}

		function punchOut(el: HTMLElement, p: Placement) {
			return anim(el, [{ transform: tf(p), opacity: 1 }, { transform: tf(p, p.k * 0.9), opacity: 0 }], {
				duration: punchOutMs,
				easing: easeIn
			});
		}

		function enter(el: HTMLElement, p: Placement, delay: number) {
			return anim(
				el,
				[
					{ transform: tf(p, p.k, 24), opacity: 0, ...blurred(blurPx) },
					{ transform: tf(p), opacity: 1, ...blurred(0) }
				],
				{ duration: lineEnterMs, delay, easing: easeOut }
			);
		}

		function leave(el: HTMLElement, p: Placement, delay: number) {
			return anim(
				el,
				[
					{ transform: tf(p), opacity: 1, ...blurred(0) },
					{ transform: tf(p, p.k, -24), opacity: 0, ...blurred(blurPx) }
				],
				{ duration: 400, delay, easing: easeIn }
			);
		}

		async function runPunches() {
			for (let i = 0; i < pEls.length && alive; i++) {
				await punchIn(pEls[i], punchPlaces[i]);
				await wait(punchHoldMs);
				await punchOut(pEls[i], punchPlaces[i]);
				refresh();
			}
		}

		function buildTagline() {
			state = 'final';
			return Promise.all([
				enter(recap, recapPlace, 0),
				...lEls.map((el, i) => enter(el, linePlaces[i], 150 + i * lineBeatMs))
			]);
		}

		function clearTagline() {
			state = 'empty';
			return Promise.all([leave(recap, recapPlace, 0), ...lEls.map((el, i) => leave(el, linePlaces[i], i * 70))]);
		}

		async function run() {
			const cs = getComputedStyle(textOf(pEls[0]));
			await document.fonts.load(`${cs.fontWeight} 16px ${cs.fontFamily}`).catch(() => {});
			await document.fonts.ready;
			if (!alive) return;
			measure();
			if (reduce) {
				show('final');
				return;
			}
			show('empty');
			for (let c = 0; c < cycles && alive; c++) {
				if (c > 0) {
					measure();
					dirty = false;
					show('empty');
				}
				await runPunches();
				await buildTagline();
				if (c === cycles - 1) break;
				await wait(restMs);
				await clearTagline();
				await wait(300);
			}
		}

		function onEnter() {
			paused = true;
			running.forEach((a) => a.pause());
		}

		function onLeave() {
			paused = false;
			running.forEach((a) => a.play());
		}

		const observer = new ResizeObserver(() => {
			if (!punchPlaces.length) return;
			if (running.size) {
				dirty = true;
				return;
			}
			measure();
			show(state);
		});

		function onFontsLoaded() {
			dirty = true;
		}
		document.fonts.addEventListener('loadingdone', onFontsLoaded);

		stage.addEventListener('mouseenter', onEnter);
		stage.addEventListener('mouseleave', onLeave);
		observer.observe(stage);
		run();

		return () => {
			alive = false;
			observer.disconnect();
			document.fonts.removeEventListener('loadingdone', onFontsLoaded);
			stage.removeEventListener('mouseenter', onEnter);
			stage.removeEventListener('mouseleave', onLeave);
			running.forEach((a) => a.cancel());
		};
	});
</script>

<div class="absolute inset-0 px-container pt-36 pb-2 md:px-28 md:pt-28">
	<Heading level={1} class="sr-only">{punches.map((p) => p.text).join('. ')}.</Heading>
	<Heading level={2} tag="p" class="sr-only">{tagline}</Heading>

	<div bind:this={stageEl} aria-hidden="true" class="relative h-full w-full">
		{#each punches as punch, i (i)}
			<span bind:this={punchEls[i]} class="absolute top-0 left-0 w-[max-content] origin-center whitespace-nowrap" style="opacity: 0">
				<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone={punch.accent ? 'brand' : 'surface'} balance={false} class="whitespace-nowrap">{punch.text}</Heading>
			</span>
		{/each}

		<span bind:this={recapEl} class="absolute top-0 left-0 w-[max-content] origin-center whitespace-nowrap" style="opacity: 0">
			<Heading level={2} tag="span" size="md" sizeMd="lg" weight="bold" leading="none" tracking="tight" tone="surface" balance={false} class="whitespace-nowrap">
				{#each punches as punch, i (i)}{#if i > 0}<span aria-hidden="true">&ensp;·&ensp;</span>{/if}<Heading level={2} tag="span" size="md" sizeMd="lg" weight="bold" leading="none" tracking="tight" tone={punch.accent ? 'brand' : 'surface'} balance={false}>{punch.text}</Heading>{/each}
			</Heading>
		</span>

		{#each taglineLines as line, i (i)}
			<span bind:this={lineEls[i]} class="absolute top-0 left-0 w-[max-content] origin-center whitespace-nowrap" style="opacity: 0">
				<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false} class="whitespace-nowrap">{line}</Heading>
			</span>
		{/each}
	</div>
</div>
