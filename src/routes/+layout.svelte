<script lang="ts">
	import './layout.css';
	import Preloader from '$lib/components/layout/Preloader.svelte';
	import SmoothScroll from '$lib/components/layout/SmoothScroll.svelte';
	import CookieConsentBanner from '$lib/components/layout/CookieConsentBanner.svelte';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import { announcementState } from '$lib/components/layout/announcement-state.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import BackToTop from '$lib/components/layout/BackToTop.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import ContactBanner from '$lib/components/sections/ContactBanner.svelte';
	import { page } from '$app/state';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { lenisState } from '$lib/lenis.svelte';
	import { heroDirection } from '$lib/hero/pages';
	import { consentState } from '$lib/consent/consent-state.svelte';
	import { siteContent } from '$lib/content';
	import type { LayoutProps } from './$types';

	const pageTitle = 'Matr Labs: Engineering for Art';
	const pageDescription = 'Oil prints made to order. Matr labs is coming back soon.';
	const shareImage = `${siteContent.url}/images/og-share.webp`;

	let { data, children }: LayoutProps = $props();

	// svelte-ignore state_referenced_locally -- seeds initial render (incl. SSR) from the cookie; the banner owns updates after that
	consentState.dismissed = data.cookieNoticeDismissed;
	// svelte-ignore state_referenced_locally -- seeds initial render (incl. SSR) from the cookie; the close button owns updates after that
	announcementState.dismissed = data.announcementDismissed;

	afterNavigate(({ from, to, type }) => {
		if (!from || !to || type === 'popstate' || from.url.pathname === to.url.pathname) return;
		const lenis = lenisState.instance;
		const target = to.url.hash ? document.querySelector<HTMLElement>(to.url.hash) : null;
		if (target) {
			if (lenis) lenis.scrollTo(target, { offset: -72, immediate: true, force: true });
			else target.scrollIntoView();
			return;
		}
		lenis?.scrollTo(0, { immediate: true, force: true });
		window.scrollTo(0, 0);
	});

	onNavigate((navigation) => {
		if (!navigation.from || !navigation.to || !document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const direction = heroDirection(navigation.from.url.pathname, navigation.to.url.pathname);
		if (!direction) return;

		const root = document.documentElement;
		root.dataset.heroDirection = direction;

		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
			transition.finished.finally(() => delete root.dataset.heroDirection);
		});
	});
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

<AnnouncementBar />
<Header formToken={data.formToken} />
<BackToTop />
<Toast />

<main>
	{@render children()}
	{#if page.url.pathname !== '/contact'}
		<ContactBanner />
	{/if}
</main>

<Footer formToken={data.formToken} />
