type EventProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
	interface Window {
		rybbit?: {
			event: (name: string, properties?: EventProperties) => void;
		};
	}
}

export function trackEvent(name: string, properties?: EventProperties): void {
	if (typeof window === 'undefined') return;
	try {
		window.rybbit?.event(name, properties);
	} catch {
		/* analytics must never break the app */
	}
}
