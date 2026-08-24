<script lang="ts" module>
	export type IconName =
		| 'arrow-right'
		| 'close'
		| 'menu'
		| 'send'
		| 'texture'
		| 'droplet'
		| 'layers'
		| 'instagram'
		| 'twitter'
		| 'upload'
		| 'file'
		| 'message'
		| 'truck'
		| 'palette'
		| 'ban'
		| 'calendar'
		| 'cart'
		| 'expand'
		| 'bolt'
		| 'check'
		| 'chevron-down';

	type IconDef = { body: string; fill?: boolean; strokeWidth?: number };

	const ICONS: Record<IconName, IconDef> = {
		'arrow-right': { strokeWidth: 2.5, body: '<path d="M5 12h14M13 5l7 7-7 7" />' },
		close: { strokeWidth: 2.5, body: '<path d="M18 6L6 18M6 6l12 12" />' },
		menu: { strokeWidth: 2.5, body: '<path d="M4 7h16M4 12h16M4 17h16" />' },
		send: { strokeWidth: 2.5, body: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />' },
		texture: { strokeWidth: 2, body: '<path d="M4 20L20 4M4 12L12 4M12 20L20 12" />' },
		droplet: { strokeWidth: 2, body: '<path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.31 0z" />' },
		layers: {
			strokeWidth: 2,
			body: '<path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 17.5l9 5 9-5" />'
		},
		instagram: {
			strokeWidth: 1.75,
			body:
				'<rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />'
		},
		twitter: { strokeWidth: 1.75, body: '<path d="M4 4l16 16M20 4L4 20" />' },
		upload: {
			strokeWidth: 1.75,
			body: '<path d="M12 16V4M12 4L7 9M12 4l5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />'
		},
		file: {
			strokeWidth: 1.75,
			body:
				'<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" />'
		},
		message: { strokeWidth: 1.75, body: '<path d="M4 5h16v10H9l-4 4V5z" />' },
		truck: {
			strokeWidth: 1.75,
			body:
				'<path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18.5" r="1.5" /><circle cx="17" cy="18.5" r="1.5" />'
		},
		palette: {
			strokeWidth: 1.75,
			body:
				'<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6h1.9a4.5 4.5 0 0 0 4.5-4.5C21 6.5 17 3 12 3z" /><circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="16" cy="9.5" r="1.1" fill="currentColor" stroke="none" />'
		},
		ban: { strokeWidth: 1.75, body: '<circle cx="12" cy="12" r="9" /><path d="M5.8 5.8l12.4 12.4" />' },
		calendar: {
			strokeWidth: 1.75,
			body: '<rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />'
		},
		cart: {
			strokeWidth: 1.75,
			body:
				'<path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.8L21 8H6" /><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" /><circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />'
		},
		expand: {
			strokeWidth: 1.5,
			body:
				'<rect x="7" y="7" width="10" height="10" /><path d="M3 3l4.5 4.5M21 3l-4.5 4.5M3 21l4.5-4.5M21 21l-4.5-4.5" />'
		},
		bolt: {
			fill: true,
			body: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />'
		},
		check: { strokeWidth: 3, body: '<path d="M4 12l5 5L20 6" />' },
		'chevron-down': { strokeWidth: 2, body: '<path d="M6 9l6 6 6-6" />' }
	};
</script>

<script lang="ts">
	let {
		name,
		class: cls = 'h-5 w-5',
		strokeWidth
	}: { name: IconName; class?: string; strokeWidth?: number } = $props();

	const def = $derived(ICONS[name]);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill={def.fill ? 'currentColor' : 'none'}
	stroke={def.fill ? 'none' : 'currentColor'}
	stroke-width={strokeWidth ?? def.strokeWidth ?? 2}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cls}
>
	{@html def.body}
</svg>
