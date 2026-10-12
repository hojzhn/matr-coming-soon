import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			spacing: ['section', 'container']
		},
		classGroups: {
			'font-size': [{ text: ['hero', 'display'] }]
		}
	}
});

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
