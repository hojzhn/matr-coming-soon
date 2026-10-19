import { navContent } from '$lib/content';

export const heroPages = navContent.items;

export function heroPageIndex(pathname: string) {
	return heroPages.findIndex((item) => item.href === pathname);
}

export function heroDirection(fromPath: string, toPath: string): 'next' | 'prev' | null {
	const from = heroPageIndex(fromPath);
	const to = heroPageIndex(toPath);
	if (from < 0 || to < 0 || from === to) return null;
	const steps = (to - from + heroPages.length) % heroPages.length;
	return steps <= heroPages.length / 2 ? 'next' : 'prev';
}
