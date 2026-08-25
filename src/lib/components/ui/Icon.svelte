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
		| 'chevron-down'
		| 'mail'
		| 'hand'
		| 'cookie';

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
		'chevron-down': { strokeWidth: 2, body: '<path d="M6 9l6 6 6-6" />' },
		mail: {
			strokeWidth: 1.75,
			body: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />'
		},
		hand: {
			strokeWidth: 1.75,
			body:
				'<path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />'
		},
		// Source: cookie-bite-regular-full.svg (Font Awesome Pro), viewBox 0 0 640 640 — scaled
		// 24/640 = 0.0375 to fit this component's 24x24 viewBox convention.
		cookie: {
			fill: true,
			body:
				'<g transform="scale(0.0375)"><path d="M245.9 547.3C223.8 544.2 203.2 534.1 187.2 518.6L126.8 460.2C110.8 444.6 100 424.3 96.2 402.3L81.6 319.5C77.7 297.4 80.9 274.7 90.7 254.6L127.4 179C137.2 158.9 153.1 142.4 172.8 131.8L246.8 92.3C266.5 81.8 289.1 77.8 311.2 80.9C316.6 81.7 320.7 86.1 321.5 91.5C329.9 146.2 373 189.6 427.7 198.3C435.4 199.5 441.6 205.4 443.4 212.9C455 263.2 496.3 302.1 547.9 310.3C553.2 311.1 557.6 315.1 558.5 320.4C562.4 342.5 559.2 365.2 549.4 385.3L512.6 461C502.8 481.1 486.9 497.6 467.2 508.2L393.2 547.7C373.5 558.2 350.9 562.2 328.8 559.1L245.8 547.4zM269.4 134.8L195.4 174.3C184.7 180 176 189 170.6 200L133.9 275.6C128.5 286.6 126.8 299.1 128.9 311.2L143.4 394C145.5 406.1 151.4 417.2 160.2 425.7L220.5 484.1C229.3 492.6 240.5 498.1 252.5 499.8L335.5 511.5C347.5 513.2 359.8 511 370.6 505.3L444.6 465.8C455.3 460 464 451 469.4 440L506.1 364.5C508.3 360 509.8 355.4 510.8 350.6C459.8 333.1 419.4 292.9 401.7 241.9C345.6 226.7 300.7 184.4 281.7 130C277.4 131.1 273.3 132.8 269.3 134.9zM272 208C289.7 208 304 222.3 304 240C304 257.7 289.7 272 272 272C254.3 272 240 257.7 240 240C240 222.3 254.3 208 272 208zM240 368C257.7 368 272 382.3 272 400C272 417.7 257.7 432 240 432C222.3 432 208 417.7 208 400C208 382.3 222.3 368 240 368zM368 368C368 350.3 382.3 336 400 336C417.7 336 432 350.3 432 368C432 385.7 417.7 400 400 400C382.3 400 368 385.7 368 368z" /></g>'
		}
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
