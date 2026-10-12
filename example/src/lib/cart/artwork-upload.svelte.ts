import { SvelteMap } from 'svelte/reactivity';
import { orderContent } from '$lib/content';

export class ArtworkUploadError extends Error {}

export class ArtworkUpload {
	status = $state<'uploading' | 'done' | 'error'>('uploading');
	progress = $state(0);
	path = $state<string | null>(null);
	readonly promise: Promise<string>;

	private controller = new AbortController();
	private xhr: XMLHttpRequest | null = null;

	constructor(formToken: string, file: File) {
		this.promise = this.run(formToken, file);
		this.promise.then(
			(path) => {
				this.path = path;
				this.progress = 1;
				this.status = 'done';
			},
			() => {
				this.status = 'error';
			}
		);
	}

	abort(): void {
		this.controller.abort();
		this.xhr?.abort();
	}

	private async run(formToken: string, file: File): Promise<string> {
		const res = await fetch('/api/order/upload-url', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				formToken,
				files: [{ index: 0, fileName: file.name, fileType: file.type, fileSize: file.size }]
			}),
			signal: this.controller.signal
		});
		const data = await res.json();
		if (!data.ok) throw new ArtworkUploadError(data.error || orderContent.cart.errorGeneric);

		const { path, signedUrl } = data.uploads[0] as { path: string; signedUrl: string };
		await this.put(signedUrl, file);
		return path;
	}

	private put(signedUrl: string, file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			this.xhr = xhr;
			xhr.open('PUT', signedUrl);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable) this.progress = e.loaded / e.total;
			};
			xhr.onload = () =>
				xhr.status >= 200 && xhr.status < 300
					? resolve()
					: reject(new ArtworkUploadError(orderContent.form.errorUploadFailed));
			xhr.onerror = () => reject(new ArtworkUploadError(orderContent.form.errorUploadFailed));
			xhr.onabort = () => reject(new ArtworkUploadError(orderContent.form.errorUploadFailed));
			xhr.send(file);
		});
	}
}

const uploads = new SvelteMap<File, ArtworkUpload>();

export function startArtworkUpload(formToken: string, file: File): ArtworkUpload {
	const existing = uploads.get(file);
	if (existing && existing.status !== 'error') return existing;

	const upload = new ArtworkUpload(formToken, file);
	uploads.set(file, upload);
	upload.promise.catch(() => {});
	return upload;
}

export function getArtworkUpload(file: File | null): ArtworkUpload | null {
	return file ? (uploads.get(file) ?? null) : null;
}

export function releaseArtworkUpload(file: File | null): void {
	const upload = getArtworkUpload(file);
	if (!upload) return;
	if (upload.status === 'uploading') upload.abort();
	uploads.delete(file!);
}
