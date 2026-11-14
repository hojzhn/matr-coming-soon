const reserved = new Set(['www', 'internal', 'analytics', 'api', 'app', 'mail', 'shop']);

export function artistHost(hostname: string): string | null {
	const match = hostname.match(/^([a-z0-9-]+)\.(?:matr\.art|localhost)$/);
	if (!match || reserved.has(match[1])) return null;
	return match[1];
}
