import { lenisState } from '$lib/lenis.svelte';

export function smoothScrollIfSamePage(event: MouseEvent, href: string) {
	if (event.defaultPrevented || event.button !== 0) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

	const url = new URL(href, location.href);
	if (url.origin !== location.origin || url.pathname !== location.pathname) return;

	const target = url.hash ? document.querySelector<HTMLElement>(url.hash) : null;
	if (url.hash && !target) return;

	event.preventDefault();

	const lenis = lenisState.instance;
	if (lenis) {
		lenis.scrollTo(target ?? 0, { offset: target ? -72 : 0, duration: 1.2 });
	} else if (target) {
		target.scrollIntoView({ behavior: 'smooth' });
	} else {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	if (url.hash) history.replaceState(history.state, '', url.hash);
}
