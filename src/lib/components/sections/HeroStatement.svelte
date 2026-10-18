<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';

	let {
		question,
		lines,
		emphasis,
		answer,
		answerLines,
		answerPunch = []
	}: {
		question: string;
		lines: string[][];
		emphasis?: string;
		answer: string;
		answerLines: string[];
		answerPunch?: number[];
	} = $props();

	type Placement = { x: number; y: number; s: number; f?: number };
	type Token = { text: string; li: number; wi: number };

	const cycles = 4;
	const beatMs = 520;
	const punchMs = 300;
	const enterMs = 340;
	const questionHoldMs = 900;
	const answerHoldMs = 3600;
	const gapRatio = 0.035;
	const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const easeIn = 'cubic-bezier(0.64, 0, 0.78, 0)';
	const easeInOut = 'cubic-bezier(0.76, 0, 0.24, 1)';

	function tokenize(source: string[][]): Token[] {
		return source.flatMap((line, li) => line.map((text, wi) => ({ text, li, wi })));
	}

	function splitAnswerLine(line: string) {
		const parts = line.split(' ');
		const out: string[] = [];
		for (let i = 0; i < parts.length; i++) {
			if (parts[i] === '+' && i + 1 < parts.length) {
				out.push(`+ ${parts[i + 1]}`);
				i++;
			} else out.push(parts[i]);
		}
		return out;
	}

	const words = $derived(tokenize(lines));
	const answerGrid = $derived(answerLines.map((line, i) => (answerPunch.includes(i) ? splitAnswerLine(line) : [line])));
	const answerTokens = $derived(tokenize(answerGrid));

	let innerEl = $state<HTMLDivElement>();
	let bigEl = $state<HTMLDivElement>();
	let smallEl = $state<HTMLDivElement>();
	let answerMeasureEl = $state<HTMLDivElement>();
	let wordEls = $state<HTMLSpanElement[]>([]);
	let answerEls = $state<HTMLSpanElement[]>([]);

	function tf(p: Placement, dy = 0) {
		return `translate(${p.x}px, ${p.y + dy}px) scale(${p.s / (p.f ?? 1)})`;
	}

	$effect(() => {
		if (!innerEl || !bigEl || !smallEl || !answerMeasureEl) return;
		const inner = innerEl;
		const big = bigEl;
		const small = smallEl;
		const answerMeasure = answerMeasureEl;
		const els = wordEls.slice(0, words.length);
		const aEls = answerEls.slice(0, answerTokens.length);
		const emphasisIndex = words.findIndex((w) => w.text === emphasis);
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const blurPx = window.matchMedia('(pointer: coarse)').matches ? 0 : 10;
		const blurred = (px: number) => (blurPx ? { filter: `blur(${px}px)` } : {});
		const ctx = document.createElement('canvas').getContext('2d')!;

		let bigPlaces: Placement[] = [];
		let smallPlaces: Placement[] = [];
		let answerPlaces: Placement[] = [];
		let state: 'empty' | 'big' | 'answer' = 'empty';
		let dirty = false;
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

		function ink(el: HTMLElement) {
			const cs = getComputedStyle(el);
			ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
			const m = ctx.measureText((el.textContent ?? '').trim());
			return { top: m.fontBoundingBoxAscent - m.actualBoundingBoxAscent, bottom: m.fontBoundingBoxAscent + m.actualBoundingBoxDescent };
		}

		function layoutBlock(
			container: HTMLElement,
			tokens: Token[],
			nodes: HTMLElement[],
			width: number,
			height: number,
			anchor: 'top' | 'bottom',
			top: number,
			frame: number
		) {
			const lineEls = Array.from(container.querySelectorAll<HTMLElement>('[data-line]')).map((l) => l.firstElementChild as HTMLElement);
			const rects = lineEls.map((l) => l.getBoundingClientRect());
			const inks = lineEls.map(ink);
			let scales = rects.map((r) => width / r.width);
			let gap = width * gapRatio;
			const total = inks.reduce((sum, k, i) => sum + (k.bottom - k.top) * scales[i], 0) + gap * (rects.length - 1);
			const fit = Math.min(1, height / total);
			const dx = (frame - width * fit) / 2;
			scales = scales.map((s) => s * fit);
			gap *= fit;
			let cursor = anchor === 'bottom' ? top + height - total * fit : top;
			const lineTops = inks.map((k, i) => {
				const t = cursor - k.top * scales[i];
				cursor += (k.bottom - k.top) * scales[i] + gap;
				return t;
			});
			const offsets = offsetsOf(nodes);
			return tokens.map((t, i) => {
				const r = container.querySelector<HTMLElement>(`[data-tok="${t.li}-${t.wi}"]`)!.getBoundingClientRect();
				const line = rects[t.li];
				const s = scales[t.li];
				return {
					x: dx + (r.left - line.left) * s - offsets[i].x * s,
					y: lineTops[t.li] + (r.top - line.top) * s - offsets[i].y * s,
					s
				};
			});
		}

		function sizeOf(el: HTMLElement) {
			return el.firstElementChild as HTMLElement;
		}

		function measure() {
			[...els, ...aEls].forEach((el) => (sizeOf(el).style.fontSize = ''));
			const box = inner.getBoundingClientRect();
			const width = Math.min(box.width, 1200);
			const height = box.height;

			bigPlaces = layoutBlock(big, words, els, width, height, 'bottom', 0, box.width);

			const wordOffsets = offsetsOf(els);
			const baseSize = parseFloat(getComputedStyle(els[0].firstElementChild as Element).fontSize);
			const smallBox = small.getBoundingClientRect();
			const smallSize = parseFloat(getComputedStyle(small.firstElementChild as Element).fontSize);
			const k = smallSize / baseSize;
			const smallRects = words.map((_, i) => small.querySelector<HTMLElement>(`[data-small="${i}"]`)!.getBoundingClientRect());
			const smallWidth = Math.max(...smallRects.map((r) => r.right)) - smallBox.left;
			const smallDx = Math.max(0, (box.width - smallWidth) / 2);
			smallPlaces = smallRects.map((r, i) => ({
				x: smallDx + r.left - smallBox.left - wordOffsets[i].x * k,
				y: r.top - smallBox.top - wordOffsets[i].y * k,
				s: k
			}));

			const answerTop = smallBox.height + Math.max(16, smallSize * 1.1);
			answerPlaces = layoutBlock(answerMeasure, answerTokens, aEls, width, height - answerTop, 'top', answerTop, box.width);

			els.forEach((el, i) => {
				const f = bigPlaces[i].s;
				bigPlaces[i].f = f;
				smallPlaces[i].f = f;
				sizeOf(el).style.fontSize = `${baseSize * f}px`;
			});
			aEls.forEach((el, i) => {
				const f = answerPlaces[i].s;
				answerPlaces[i].f = f;
				sizeOf(el).style.fontSize = `${baseSize * f}px`;
			});
		}

		function refresh() {
			if (!dirty) return;
			dirty = false;
			measure();
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
					{ transform: tf({ ...p, s: p.s * 1.12 }, -20 * p.s), opacity: 0, ...blurred(blurPx) },
					{ transform: tf(p), opacity: 1, ...blurred(0) }
				],
				{ duration: enterMs, delay, easing: easeOut }
			);
		}

		function punch(el: Element, p: Placement, delay: number) {
			const grow = (f: number) => ({ ...p, s: p.s * f });
			return anim(
				el,
				[
					{ transform: tf(grow(1.6)), opacity: 0 },
					{ transform: tf(grow(0.92)), opacity: 1, offset: 0.45 },
					{ transform: tf(grow(1.04)), opacity: 1, offset: 0.75 },
					{ transform: tf(p), opacity: 1 }
				],
				{ duration: 380, delay, easing: easeOut }
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
			const starts: number[] = [];
			let t = 0;
			answerGrid.forEach((line, li) => {
				starts[li] = t;
				t += answerPunch.includes(li) ? line.length * punchMs + 200 : beatMs;
			});
			return Promise.all(
				aEls.map((el, i) => {
					const tok = answerTokens[i];
					return answerPunch.includes(tok.li)
						? punch(el, answerPlaces[i], starts[tok.li] + tok.wi * punchMs)
						: enter(el, answerPlaces[i], starts[tok.li]);
				})
			);
		}

		function reset() {
			const out = (el: Element, p: Placement, delay: number) =>
				anim(
					el,
					[
						{ transform: tf(p), opacity: 1, ...blurred(0) },
						{ transform: tf(p, -30 * p.s), opacity: 0, ...blurred(blurPx) }
					],
					{ duration: 420, delay, easing: easeIn }
				);
			state = 'empty';
			return Promise.all([
				...aEls.map((el, i) => out(el, answerPlaces[i], answerTokens[i].li * 70)),
				...els.map((el, i) => out(el, smallPlaces[i], 0))
			]);
		}

		async function run() {
			const cs = getComputedStyle(els[0].firstElementChild as Element);
			await document.fonts.load(`${cs.fontWeight} 16px ${cs.fontFamily}`).catch(() => {});
			await document.fonts.ready;
			if (!alive) return;
			measure();
			if (reduce) {
				show('answer');
				return;
			}
			show('empty');
			for (let c = 0; c < cycles && alive; c++) {
				if (c > 0) {
					measure();
					dirty = false;
				}
				await buildQuestion();
				await blink();
				await wait(questionHoldMs);
				refresh();
				await fold();
				refresh();
				await buildAnswer();
				if (c === cycles - 1) break;
				await wait(answerHoldMs);
				await reset();
				show('empty');
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
			if (!bigPlaces.length) return;
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

		inner.addEventListener('mouseenter', onEnter);
		inner.addEventListener('mouseleave', onLeave);
		observer.observe(inner);
		run();

		return () => {
			alive = false;
			observer.disconnect();
			document.fonts.removeEventListener('loadingdone', onFontsLoaded);
			inner.removeEventListener('mouseenter', onEnter);
			inner.removeEventListener('mouseleave', onLeave);
			running.forEach((a) => a.cancel());
		};
	});
</script>

{#snippet measureBlock(grid: string[][])}
	{#each grid as line, li (li)}
		<div data-line class="w-[max-content] whitespace-nowrap">
			<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false} class="whitespace-nowrap">
				{#each line as word, wi (wi)}<span data-tok={`${li}-${wi}`}>{word}</span>{wi < line.length - 1 ? ' ' : ''}{/each}
			</Heading>
		</div>
	{/each}
{/snippet}

{#snippet token(text: string)}
	<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false} class="whitespace-nowrap">{text}</Heading>
{/snippet}

<div class="absolute inset-0 px-container pt-24 pb-2 md:px-28 md:pt-28">
	<Heading level={1} class="sr-only">{question}</Heading>
	<Heading level={2} tag="p" class="sr-only">{answer}</Heading>

	<div bind:this={innerEl} aria-hidden="true" class="relative h-full w-full">
		<div bind:this={bigEl} class="invisible absolute top-0 left-0">
			{@render measureBlock(lines)}
		</div>

		<div bind:this={smallEl} class="invisible absolute top-0 left-0 w-full max-w-5xl">
			<Heading level={2} tag="p" size="md" sizeMd="lg" weight="bold" leading="tight" tracking="tighter" tone="surface" balance={false}>
				{#each words as word, i (i)}<span data-small={i}>{word.text}</span>{i < words.length - 1 ? ' ' : ''}{/each}
			</Heading>
		</div>

		<div bind:this={answerMeasureEl} class="invisible absolute top-0 left-0">
			{@render measureBlock(answerGrid)}
		</div>

		{#each words as word, i (i)}
			<span bind:this={wordEls[i]} class="absolute top-0 left-0 w-[max-content] origin-top-left whitespace-nowrap" style="opacity: 0">
				{@render token(word.text)}
			</span>
		{/each}

		{#each answerTokens as tok, i (i)}
			<span bind:this={answerEls[i]} class="absolute top-0 left-0 w-[max-content] origin-top-left whitespace-nowrap" style="opacity: 0">
				{@render token(tok.text)}
			</span>
		{/each}
	</div>
</div>
