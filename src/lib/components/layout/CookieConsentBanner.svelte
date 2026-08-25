<script lang="ts">
	import { fly } from 'svelte/transition';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LegalModal from './LegalModal.svelte';
	import { cookieConsentContent, legalContent } from '$lib/content';
	import { consentState } from '$lib/consent/consent-state.svelte';
	import { loadContentsquare } from '$lib/analytics';

	let openPrivacy = $state(false);

	function accept() {
		consentState.status = 'accepted';
		document.cookie = 'cookie-consent=accepted; path=/; max-age=31536000; samesite=lax';
		loadContentsquare();
	}

	function reject() {
		consentState.status = 'rejected';
		document.cookie = 'cookie-consent=rejected; path=/; max-age=31536000; samesite=lax';
	}
</script>

{#if consentState.status === 'unset'}
	<div
		class="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-surface"
		transition:fly={{ y: 24, duration: 250 }}
	>
		<Container width="full" class="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-start gap-3">
				<Icon name="cookie" class="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
				<Heading level={6} tag="p" tone="muted" class="max-w-2xl">
					{cookieConsentContent.banner.body}
					<button type="button" onclick={() => (openPrivacy = true)} class="underline hover:text-ink">
						{cookieConsentContent.banner.policyLinkLabel}
					</button>
				</Heading>
			</div>
			<div class="flex shrink-0 gap-1.5">
				<ArrowLink
					type="button"
					variant="button"
					size="xs"
					sizeMd="sm"
					arrow={false}
					label={cookieConsentContent.banner.rejectLabel}
					onclick={reject}
					class="flex-1 px-3 py-1.5 sm:flex-none"
				/>
				<ArrowLink
					type="button"
					variant="button"
					size="xs"
					sizeMd="sm"
					arrow={false}
					label={cookieConsentContent.banner.acceptLabel}
					onclick={accept}
					class="flex-1 bg-brand px-3 py-1.5 sm:flex-none"
				/>
			</div>
		</Container>
	</div>
{/if}

<LegalModal doc={legalContent.privacy} open={openPrivacy} onclose={() => (openPrivacy = false)} />
