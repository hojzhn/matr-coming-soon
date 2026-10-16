<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';

	let {
		question,
		lines,
		emphasis,
		answer,
		answerLines
	}: {
		question: string;
		lines: string[][];
		emphasis?: string;
		answer: string;
		answerLines: string[];
	} = $props();

	type Placement = { x: number; y: number; s: number };

	const cycles = 4;
	const beatMs = 520;
	const enterMs = 340;
	const questionHoldMs = 900;
	const answerHoldMs = 3600;
	const lineTightness = 0.8;
	const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const easeIn = 'cubic-bezier(0.64, 0, 0.78, 0)';
	const easeInOut = 'cubic-bezier(0.76, 0, 0.24, 1)';

	const words = $derived(lines.flatMap((line, li) => line.map((text, wi) => ({ text, li, wi }))));

	let innerEl = $state<HTMLDivElement>();
	let bigEl = $state<HTMLDivElement>();
	let smallEl = $state<HTMLDivElement>();
	let answerMeasureEl = $state<HTMLDivElement>();
	let wordEls = $state<HTMLSpanElement[]>([]);
	let answerEls = $state<HTMLSpanElement[]>([]);

	function tf(p: Placement, dy = 0) {
		return `translate(${p.x}px, ${p.y + dy}px) scale(${p.s})`;
	}

	$effect(() => {
		if (!innerEl || !bigEl || !smallEl || !answerMeasureEl) return;
		const inner = innerEl;
		const big = bigEl;
		const small = smallEl;
		const answerMeasure = answerMeasureEl;
		const els = wordEls.slice(0, words.length);
		const aEls = answerEls.slice(0, answerLines.length);
		const emphasisIndex = words.findIndex((w) => w.text === emphasis);
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let bigPlaces: Placement[] = [];
		let smallPlaces: Placement[] = [];
		let answerPlaces: Placement[] = [];
		let state: 'empty' | 'big' | 'answer' = 'empty';
		let alive = true;
		let paused = false;
		const running = new Set<Animation>();

		function offsetsOf(nodes: HTMLElement[]) {
			return nodes.map((el) => {
				const saved = el.style.transform;
				el.style.transform = 'none';
				const outer = el.getBoundingClientRect();
				const text = (el.firstElementChild as HTMLElement).getBoundingClientRect();
				el.style.transform = saved;
				return { x: text.left - outer.left, y: text.top - outer.top };
			});
		}

		function fitBlock(lineRects: DOMRect[], width: number, height: number, anchor: 'top' | 'bottom', top: number) {
			const pitch = lineRects.map((r) => r.height * lineTightness);
			let scales = lineRects.map((r) => width / r.width);
			const total = pitch.reduce((sum, p, i) => sum + p * scales[i], 0) + (lineRects.at(-1)!.height - pitch.at(-1)!) * scales.at(-1)!;
			const fit = Math.min(1, height / total);
			scales = scales.map((s) => s * fit);
			let y = anchor === 'bottom' ? top + height - total * fit : top;
			const tops = lineRects.map((_, i) => {
				const t = y;
				y += pitch[i] * scales[i];
				return t;
			});
			return { scales, tops };
		}

		function measure() {
			const box = inner.getBoundingClientRect();
			const width = Math.min(box.width, 1200);
			const height = box.height;

			const wordOffsets = offsetsOf(els);
			const lineRects = Array.from(big.querySelectorAll<HTMLElement>('[data-big-line]')).map((l) =>
				(l.firstElementChild as HTMLElement).getBoundingClientRect()
			);
			const q = fitBlock(lineRects, width, height, 'bottom', 0);
			bigPlaces = words.map((w, i) => {
				const r = big.querySelector<HTMLElement>(`[data-word="${w.li}-${w.wi}"]`)!.getBoundingClientRect();
				const line = lineRects[w.li];
				const s = q.scales[w.li];
				return {
					x: (r.left - line.left) * s - wordOffsets[i].x * s,
					y: q.tops[w.li] + (r.top - line.top) * s - wordOffsets[i].y * s,
					s
				};
			});

			const baseSize = parseFloat(getComputedStyle(els[0].firstElementChild as Element).fontSize);
			const smallBox = small.getBoundingClientRect();
			const smallSize = parseFloat(getComputedStyle(small.firstElementChild as Element).fontSize);
			const k = smallSize / baseSize;
			smallPlaces = words.map((_, i) => {
				const r = small.querySelector<HTMLElement>(`[data-small="${i}"]`)!.getBoundingClientRect();
				return { x: r.left - smallBox.left - wordOffsets[i].x * k, y: r.top - smallBox.top - wordOffsets[i].y * k, s: k };
			});

			const answerTop = smallBox.height + Math.max(16, smallSize * 1.1);
			const answerOffsets = offsetsOf(aEls);
			const answerRects = Array.from(answerMeasure.querySelectorAll<HTMLElement>('[data-answer-line]')).map((l) =>
				(l.firstElementChild as HTMLElement).getBoundingClientRect()
			);
			const a = fitBlock(answerRects, width, height - answerTop, 'top', answerTop);
			answerPlaces = aEls.map((_, i) => ({
				x: -answerOffsets[i].x * a.scales[i],
				y: a.tops[i] - answerOffsets[i].y * a.scales[i],
				s: a.scales[i]
			}));
		}

		function show(which: typeof state) {
			state = which;
			els.forEach((el, i) => {
				el.style.transform = tf(which === 'answer' ? smallPlaces[i] : bigPlaces[i]);
				el.style.opacity = which === 'empty' ? '0' : '1';
				el.style.filter = 'none';
			});
			aEls.forEach((el, i) => {
				el.style.transform = tf(answerPlaces[i]);
				el.style.opacity = which === 'answer' ? '1' : '0';
				el.style.filter = 'none';
			});
		}

		function anim(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
			const a = el.animate(keyframes, { fill: 'both', ...options });
			running.add(a);
			if (paused) a.pause();
			return a.finished
				.then(() => {
					if (!alive) return;
					a.commitStyles();
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

		function enter(el: Element, p: Placement, delay: number) {
			return anim(
				el,
				[
					{ transform: tf({ ...p, s: p.s * 1.12 }, -20 * p.s), opacity: 0, filter: 'blur(10px)' },
					{ transform: tf(p), opacity: 1, filter: 'blur(0px)' }
				],
				{ duration: enterMs, delay, easing: easeOut }
			);
		}

		function buildQuestion() {
			state = 'big';
			return Promise.all(els.map((el, i) => enter(el, bigPlaces[i], words[i].li * beatMs)));
		}

		function blink() {
			if (emphasisIndex < 0) return Promise.resolve();
			return anim(els[emphasisIndex], [{ opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }], {
				duration: 900,
				easing: 'steps(1, end)'
			});
		}

		function fold() {
			return Promise.all(
				els.map((el, i) =>
					anim(el, [{ transform: tf(bigPlaces[i]) }, { transform: tf(smallPlaces[i]) }], {
						duration: 800,
						delay: i * 30,
						easing: easeInOut
					})
				)
			);
		}

		function buildAnswer() {
			state = 'answer';
			return Promise.all(aEls.map((el, i) => enter(el, answerPlaces[i], i * beatMs)));
		}

		function reset() {
			const out = (el: Element, p: Placement, delay: number) =>
				anim(
					el,
					[
						{ transform: tf(p), opacity: 1, filter: 'blur(0px)' },
						{ transform: tf(p, -30 * p.s), opacity: 0, filter: 'blur(10px)' }
					],
					{ duration: 420, delay, easing: easeIn }
				);
			state = 'empty';
			return Promise.all([
				...aEls.map((el, i) => out(el, answerPlaces[i], i * 70)),
				...els.map((el, i) => out(el, smallPlaces[i], 0))
			]);
		}

		async function run() {
			await document.fonts.ready;
			if (!alive) return;
			measure();
			if (reduce) {
				show('answer');
				return;
			}
			show('empty');
			for (let c = 0; c < cycles && alive; c++) {
				await buildQuestion();
				await blink();
				await wait(questionHoldMs);
				await fold();
				await buildAnswer();
				if (c === cycles - 1) break;
				await wait(answerHoldMs);
				await reset();
				await wait(250);
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
			if (!bigPlaces.length || running.size) return;
			measure();
			show(state);
		});

		inner.addEventListener('mouseenter', onEnter);
		inner.addEventListener('mouseleave', onLeave);
		observer.observe(inner);
		run();

		return () => {
			alive = false;
			observer.disconnect();
			inner.removeEventListener('mouseenter', onEnter);
			inner.removeEventListener('mouseleave', onLeave);
			running.forEach((a) => a.cancel());
		};
	});
</script>

<div class="absolute inset-0 px-container pt-24 pb-2 md:px-28 md:pt-28">
	<Heading level={1} class="sr-only">{question}</Heading>
	<Heading level={2} tag="p" class="sr-only">{answer}</Heading>

	<div bind:this={innerEl} aria-hidden="true" class="relative h-full w-full">
		<div bind:this={bigEl} class="invisible absolute top-0 left-0">
			{#each lines as line, li (li)}
				<div data-big-line class="w-max whitespace-nowrap">
					<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false}>
						{#each line as word, wi (wi)}<span data-word={`${li}-${wi}`}>{word}</span>{wi < line.length - 1 ? ' ' : ''}{/each}
					</Heading>
				</div>
			{/each}
		</div>

		<div bind:this={smallEl} class="invisible absolute top-0 left-0 w-full max-w-5xl">
			<Heading level={2} tag="p" size="md" sizeMd="lg" weight="bold" leading="tight" tracking="tighter" tone="surface" balance={false}>
				{#each words as word, i (i)}<span data-small={i}>{word.text}</span>{i < words.length - 1 ? ' ' : ''}{/each}
			</Heading>
		</div>

		<div bind:this={answerMeasureEl} class="invisible absolute top-0 left-0">
			{#each answerLines as text, i (i)}
				<div data-answer-line class="w-max whitespace-nowrap">
					<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false} class="whitespace-nowrap">{text}</Heading>
				</div>
			{/each}
		</div>

		{#each words as word, i (i)}
			<span bind:this={wordEls[i]} class="absolute top-0 left-0 origin-top-left whitespace-nowrap will-change-transform" style="opacity: 0">
				<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false}>{word.text}</Heading>
			</span>
		{/each}

		{#each answerLines as text, i (i)}
			<span bind:this={answerEls[i]} class="absolute top-0 left-0 w-max origin-top-left whitespace-nowrap will-change-transform" style="opacity: 0">
				<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false} class="whitespace-nowrap">{text}</Heading>
			</span>
		{/each}
	</div>
</div>
