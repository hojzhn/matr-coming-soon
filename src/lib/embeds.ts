declare global {
	interface Window {
		instgrm?: { Embeds: { process: () => void } };
		twttr?: { widgets: { load: () => void } };
	}
}

function loadScript(src: string): Promise<void> {
	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = src;
		script.async = true;
		script.onload = () => resolve();
		document.body.appendChild(script);
	});
}

let instagramScript: Promise<void> | null = null;

export function loadInstagramEmbeds(): void {
	if (typeof window === 'undefined') return;
	if (window.instgrm) {
		window.instgrm.Embeds.process();
		return;
	}
	instagramScript ??= loadScript('https://www.instagram.com/embed.js');
	instagramScript.then(() => window.instgrm?.Embeds.process());
}

let twitterScript: Promise<void> | null = null;

export function loadTwitterEmbeds(): void {
	if (typeof window === 'undefined') return;
	if (window.twttr) {
		window.twttr.widgets.load();
		return;
	}
	twitterScript ??= loadScript('https://platform.twitter.com/widgets.js');
	twitterScript.then(() => window.twttr?.widgets.load());
}

export {};
