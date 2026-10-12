export interface DitherOptions {
	px?: number;
	soft?: number;
	color?: [number, number, number];
}

export class DitherFill {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private cols = 0;
	private rows = 0;
	private img: ImageData | null = null;
	private thr = new Float32Array(0);
	private px: number;
	private soft: number;
	private color: [number, number, number];
	private progress = 0;
	private raf = 0;
	private ro?: ResizeObserver;

	constructor(canvas: HTMLCanvasElement, opts: DitherOptions = {}) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.px = opts.px ?? 1;
		this.soft = opts.soft ?? 0.5;
		this.color = opts.color ?? [0, 0, 0];
		this.resize();
		this.render();
		this.ro = new ResizeObserver(() => {
			if (this.resize()) this.render();
		});
		this.ro.observe(canvas);
	}

	resize(): boolean {
		if (!this.ctx) return false;
		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;
		if (!w || !h) return false;
		this.cols = Math.max(1, Math.ceil(w / this.px));
		this.rows = Math.max(1, Math.ceil(h / this.px));
		this.canvas.width = this.cols;
		this.canvas.height = this.rows;
		this.img = this.ctx.createImageData(this.cols, this.rows);
		this.thr = new Float32Array(this.cols * this.rows);
		for (let i = 0; i < this.thr.length; i++) this.thr[i] = Math.random();
		return true;
	}

	render() {
		if ((!this.img && !this.resize()) || !this.img || !this.ctx) return;
		const data = this.img.data;
		const denom = this.rows > 1 ? this.rows - 1 : 1;
		const soft = this.soft;
		const bandTop = (1 + soft) * (1 - this.progress);
		const [r, g, b] = this.color;
		for (let y = 0; y < this.rows; y++) {
			const yN = y / denom;
			const cov = Math.min(1, Math.max(0, (yN - (bandTop - soft)) / soft));
			for (let x = 0; x < this.cols; x++) {
				const idx = y * this.cols + x;
				const i = idx * 4;
				data[i] = r;
				data[i + 1] = g;
				data[i + 2] = b;
				data[i + 3] = cov > this.thr[idx] ? 255 : 0;
			}
		}
		this.ctx.putImageData(this.img, 0, 0);
	}

	set(progress: number) {
		this.progress = Math.min(1, Math.max(0, progress));
		this.render();
	}

	animateTo(target: number, duration = 350) {
		cancelAnimationFrame(this.raf);
		const start = this.progress;
		const change = target - start;
		const t0 = performance.now();
		const tick = (now: number) => {
			const t = Math.min(1, (now - t0) / duration);
			const eased = t * t * (3 - 2 * t);
			this.set(start + change * eased);
			if (t < 1) this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	}

	destroy() {
		cancelAnimationFrame(this.raf);
		this.ro?.disconnect();
	}
}
