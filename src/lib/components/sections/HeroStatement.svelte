<script lang="ts">
	import { tick } from 'svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	let {
		question,
		lines,
		emphasis,
		answer,
		beats = []
	}: {
		question: string;
		lines: string[][];
		emphasis?: string;
		answer: string;
		beats?: { text: string; strong?: boolean }[];
	} = $props();

	type Placement = { x: number; y: number; s: number };

	const cycles = 2;
	const questionBeatMs = 520;
	const answerBeatMs = 560;
	const strongBeatMs = 680;
	const lineTightness = 0.8;
	const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const easeInOut = 'cubic-bezier(0.76, 0, 0.24, 1)';

	const words = $derived(lines.flatMap((line, li) => line.map((text, wi) => ({ text, li, wi }))));
	const answerLines = $derived(answer.split('\n'));

	let innerEl = $state<HTMLDivElement>();
	let bigEl = $state<HTMLDivElement>();
	let smallEl = $state<HTMLDivElement>();
	let answerEl = $state<HTMLDivElement>();
	let wordEls = $state<HTMLSpanElement[]>([]);
	let flashEl = $state<HTMLSpanElement>();
	let flashText = $state('');
	let answerTop = $state(0);

	function tf(p: Placement, dy = 0) {
		return `translate(${p.x}px, ${p.y + dy}px) scale(${p.s})`;
	}

	$effect(() => {
		if (!innerEl || !bigEl || !smallEl || !answerEl || !flashEl) return;
		const flash = flashEl;
		const inner = innerEl;
		const big = bigEl;
		const small = smallEl;
		const answerBox = answerEl;
		const els = wordEls.slice(0, words.length);
		const answerSpans = Array.from(answerBox.querySelectorAll<HTMLElement>('[data-line]'));
		const emphasisIndex = words.findIndex((w) => w.text === emphasis);
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let bigPlaces: Placement[] = [];
		let smallPlaces: Placement[] = [];
		let state: 'big' | 'small' = 'big';
		let alive = true;
		let paused = false;
		const running = new Set<Animation>();

		function measure() {
			const box = inner.getBoundingClientRect();
			const width = Math.min(box.width, 1200);
			const height = box.height;
			const baseSize = parseFloat(getComputedStyle(els[0].firstElementChild as Element).fontSize);

			const offsets = els.map((el) => {
				const saved = el.style.transform;
				el.style.transform = 'none';
				const outer = el.getBoundingClientRect();
				const text = (el.firstElementChild as HTMLElement).getBoundingClientRect();
				el.style.transform = saved;
				return { x: text.left - outer.left, y: text.top - outer.top };
			});

			const lineEls = Array.from(big.querySelectorAll<HTMLElement>('[data-big-line]'));
			const lineRects = lineEls.map((l) => (l.firstElementChild as HTMLElement).getBoundingClientRect());
			const pitch = lineRects.map((r) => r.height * lineTightness);
			let scales = lineRects.map((r) => width / r.width);
			const total = pitch.reduce((sum, p, i) => sum + p * scales[i], 0) + (lineRects.at(-1)!.height - pitch.at(-1)!) * scales.at(-1)!;
			const fit = Math.min(1, height / total);
			scales = scales.map((s) => s * fit);
			let y = height - total * fit;
			const lineTops = lineRects.map((_, i) => {
				const top = y;
				y += pitch[i] * scales[i];
				return top;
			});

			bigPlaces = words.map((w, i) => {
				const span = big.querySelector<HTMLElement>(`[data-word="${w.li}-${w.wi}"]`)!;
				const r = span.getBoundingClientRect();
				const line = lineRects[w.li];
				const s = scales[w.li];
				return {
					x: (r.left - line.left) * s - offsets[i].x * s,
					y: lineTops[w.li] + (r.top - line.top) * s - offsets[i].y * s,
					s
				};
			});

			const smallBox = small.getBoundingClientRect();
			const smallSize = parseFloat(getComputedStyle(small.firstElementChild as Element).fontSize);
			const k = smallSize / baseSize;
			smallPlaces = words.map((_, i) => {
				const r = small.querySelector<HTMLElement>(`[data-small="${i}"]`)!.getBoundingClientRect();
				return {
					x: r.left - smallBox.left - offsets[i].x * k,
					y: r.top - smallBox.top - offsets[i].y * k,
					s: k
				};
			});

			answerTop = smallBox.height + Math.max(16, smallSize * 0.9);
		}

		function place(which: 'big' | 'small') {
			const places = which === 'big' ? bigPlaces : smallPlaces;
			els.forEach((el, i) => (el.style.transform = tf(places[i])));
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

		function enterWords() {
			return Promise.all(
				els.map((el, i) =>
					anim(
						el,
						[
							{ transform: tf({ ...bigPlaces[i], s: bigPlaces[i].s * 1.12 }, -20 * bigPlaces[i].s), opacity: 0, filter: 'blur(10px)' },
							{ transform: tf(bigPlaces[i]), opacity: 1, filter: 'blur(0px)' }
						],
						{ duration: 340, delay: words[i].li * questionBeatMs, easing: easeOut }
					)
				)
			);
		}

		async function flashBeats() {
			const box = inner.getBoundingClientRect();
			const width = Math.min(box.width, 1200);
			const regionTop = answerTop;
			const regionHeight = Math.max(80, box.height - regionTop);
			for (const beat of beats) {
				if (!alive) return;
				flashText = beat.text;
				await tick();
				flash.style.transform = 'none';
				const outer = flash.getBoundingClientRect();
				const text = (flash.firstElementChild as HTMLElement).getBoundingClientRect();
				const cap = beat.strong ? 0.85 : 0.4;
				const s = Math.min(width / text.width, (regionHeight * cap) / text.height);
				const place = {
					x: -(text.left - outer.left) * s,
					y: regionTop + (regionHeight - text.height * s) / 2 - (text.top - outer.top) * s,
					s
				};
				await anim(
					flash,
					[
						{ transform: tf({ ...place, s: s * 1.1 }), opacity: 0, filter: 'blur(8px)' },
						{ transform: tf(place), opacity: 1, filter: 'blur(0px)', offset: 0.25 },
						{ transform: tf(place), opacity: 1, filter: 'blur(0px)', offset: 0.85 },
						{ transform: tf(place), opacity: 0, filter: 'blur(0px)' }
					],
					{ duration: beat.strong ? strongBeatMs : answerBeatMs, easing: 'linear' }
				);
			}
			flash.style.opacity = '0';
		}

		function blink() {
			if (emphasisIndex < 0) return Promise.resolve();
			return anim(els[emphasisIndex], [{ opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }], {
				duration: 900,
				easing: 'steps(1, end)'
			});
		}

		function morph(to: 'big' | 'small', duration: number) {
			const from = to === 'big' ? smallPlaces : bigPlaces;
			const target = to === 'big' ? bigPlaces : smallPlaces;
			state = to;
			return Promise.all(
				els.map((el, i) =>
					anim(el, [{ transform: tf(from[i]) }, { transform: tf(target[i]) }], {
						duration,
						delay: (to === 'small' ? i : els.length - 1 - i) * 30,
						easing: easeInOut
					})
				)
			);
		}

		function showAnswer() {
			answerBox.style.opacity = '1';
			return Promise.all(
				answerSpans.map((span, i) =>
					anim(
						span,
						[
							{ transform: 'translateY(24px)', opacity: 0, filter: 'blur(8px)' },
							{ transform: 'translateY(0px)', opacity: 1, filter: 'blur(0px)' }
						],
						{ duration: 650, delay: i * 140, easing: easeOut }
					)
				)
			);
		}

		function hideAnswer() {
			return anim(answerBox, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease-in' });
		}

		function showSettled() {
			place('small');
			els.forEach((el) => (el.style.opacity = '1'));
			answerBox.style.opacity = '1';
			answerSpans.forEach((span) => (span.style.opacity = '1'));
		}

		async function run() {
			await document.fonts.ready;
			if (!alive) return;
			measure();
			place('big');
			if (reduce) {
				state = 'small';
				showSettled();
				return;
			}
			for (let c = 0; c < cycles && alive; c++) {
				if (c === 0) await enterWords();
				else await morph('big', 700);
				await blink();
				await wait(1000);
				await morph('small', 850);
				if (beats.length) await flashBeats();
				await showAnswer();
				if (c < cycles - 1) {
					await wait(5000);
					await hideAnswer();
					answerSpans.forEach((span) => (span.style.opacity = '0'));
				}
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
			place(state);
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

		{#each words as word, i (i)}
			<span bind:this={wordEls[i]} class="absolute top-0 left-0 origin-top-left whitespace-nowrap will-change-transform" style="opacity: 0">
				<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false}>{word.text}</Heading>
			</span>
		{/each}

		<span bind:this={flashEl} class="absolute top-0 left-0 origin-top-left whitespace-nowrap will-change-transform" style="opacity: 0">
			<Heading level={2} tag="span" size="hero" weight="bold" leading="none" tracking="tighter" tone="surface" balance={false}>{flashText}</Heading>
		</span>

		<div bind:this={answerEl} class="absolute left-0 w-full" style={`top: ${answerTop}px; opacity: 0`}>
			<Heading level={2} tag="p" size="lg" sizeMd="xl" weight="bold" leading="tight" tracking="tight" tone="surface">
				{#each answerLines as text, i (i)}
					<span data-line class="block" style="opacity: 0">{text}</span>
				{/each}
			</Heading>
		</div>
	</div>
</div>
