<script lang="ts">
	import './layout.css';
	import Preloader from '$lib/components/layout/Preloader.svelte';
	import SmoothScroll from '$lib/components/layout/SmoothScroll.svelte';
	import CookieConsentBanner from '$lib/components/layout/CookieConsentBanner.svelte';
	import { consentState } from '$lib/consent/consent-state.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// svelte-ignore state_referenced_locally -- seeds initial render (incl. SSR) from the cookie; the banner owns updates after that
	const cookieConsent: 'accepted' | 'rejected' | null =
		data.cookieConsent === 'accepted' || data.cookieConsent === 'rejected' ? data.cookieConsent : null;

	consentState.status = cookieConsent ?? 'unset';
</script>

<svelte:head>
	<title>Matr Labs: Engineering for Art</title>
	<meta name="description" content="Oil prints made to order. Matr labs is coming back soon." />
	{#if cookieConsent === 'accepted'}
		<script async src="https://t.contentsquare.net/uxa/ae8b39acc16e9.js"></script>
	{/if}
</svelte:head>

<Preloader />
<SmoothScroll />
<CookieConsentBanner />

{@render children()}
