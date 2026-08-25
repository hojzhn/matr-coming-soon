const CONTENTSQUARE_SRC = 'https://t.contentsquare.net/uxa/ae8b39acc16e9.js';

let loaded = false;

export function loadContentsquare(): void {
	if (typeof document === 'undefined') return;
	if (loaded || document.querySelector(`script[src="${CONTENTSQUARE_SRC}"]`)) return;
	loaded = true;

	const script = document.createElement('script');
	script.async = true;
	script.src = CONTENTSQUARE_SRC;
	document.body.appendChild(script);
}
