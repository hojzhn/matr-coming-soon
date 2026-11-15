const reserved = new Set([
	'www',
	'api',
	'app',
	'admin',
	'internal',
	'analytics',
	'account',
	'checkout',
	'quote',
	'shop',
	'studio',
	'mail',
	'help',
	'send',
	'rsend',
	'maileraw0',
	'mailerq05'
]);

export function artistHost(hostname: string): string | null {
	const match = hostname.match(/^([a-z0-9-]+)\.(?:matr\.art|localhost)$/);
	if (!match || reserved.has(match[1])) return null;
	return match[1];
}
