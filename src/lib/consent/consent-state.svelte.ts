export const consentState = $state<{ status: 'unset' | 'accepted' | 'rejected' }>({ status: 'unset' });

export function hasAnalyticsConsent(): boolean {
	return consentState.status === 'accepted';
}
