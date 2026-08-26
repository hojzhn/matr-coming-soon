<script lang="ts">
	import './layout.css';
	import Preloader from '$lib/components/layout/Preloader.svelte';
	import SmoothScroll from '$lib/components/layout/SmoothScroll.svelte';
	import CookieConsentBanner from '$lib/components/layout/CookieConsentBanner.svelte';
	import { consentState } from '$lib/consent/consent-state.svelte';
	import { siteContent } from '$lib/content';
	import type { LayoutProps } from './$types';

	const pageTitle = 'Matr Labs: Engineering for Art';
	const pageDescription = 'Oil prints made to order. Matr labs is coming back soon.';
	const shareImage = `${siteContent.url}/images/og-share.webp`;

	let { data, children }: LayoutProps = $props();

	// svelte-ignore state_referenced_locally -- seeds initial render (incl. SSR) from the cookie; the banner owns updates after that
	consentState.dismissed = data.cookieNoticeDismissed;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={siteContent.url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteContent.name} />
	<meta property="og:url" content={siteContent.url} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={shareImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={shareImage} />

	<script src="https://analytics.matr.art/api/script.js" data-site-id="db2110d0308a" defer></script>
</svelte:head>

<Preloader />
<SmoothScroll />
<CookieConsentBanner />

{@render children()}
