<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import { contactContent, siteContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { isValidEmail, submitContact } from '$lib/contact/submit';

	let { formToken }: { formToken: string } = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let company = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!isValidEmail(email)) {
			error = contactContent.form.errorInvalidEmail;
			return;
		}

		loading = true;
		const result = await submitContact({ name, email, message, company, formToken });
		loading = false;

		if (result.ok) {
			success = true;
			trackEvent('contact_form_submitted');
		} else {
			error = result.error || contactContent.form.errorGeneric;
		}
	}
</script>

<Section id="contact" tone="surface" class="py-16 md:py-24">
	<div class="grid gap-10 md:grid-cols-2 md:gap-16">
		<div class="flex flex-col items-start gap-4">
			<Heading level={5} tag="p" tone="muted" uppercase>{contactContent.eyebrow}</Heading>
			<Heading level={1} tag="h2">{contactContent.heading}</Heading>
			<Heading level={3} tag="p" weight="medium" tone="muted" balance={false}>
				{contactContent.intro}
			</Heading>
			<ArrowLink
				href={`mailto:${siteContent.email}`}
				label={siteContent.email}
				icon="mail"
				arrow={false}
				size="base"
				sizeMd="lg"
				class="-ml-3"
			/>
		</div>

		{#if success}
			<Heading level={3}>{contactContent.form.successMessage}</Heading>
		{:else}
			<form class="flex flex-col" {onsubmit}>
				<input
					type="text"
					name="company"
					bind:value={company}
					tabindex="-1"
					autocomplete="off"
					class="hidden"
					aria-hidden="true"
				/>
				<Field
					label={contactContent.form.nameLabel}
					bind:value={name}
					placeholder={contactContent.form.namePlaceholder}
					autocomplete="name"
					required
				/>
				<Field
					label={contactContent.form.emailLabel}
					type="email"
					bind:value={email}
					placeholder={contactContent.form.emailPlaceholder}
					autocomplete="email"
					required
				/>
				<Field label={contactContent.form.messageLabel} required>
					<textarea
						bind:value={message}
						placeholder={contactContent.form.messagePlaceholder}
						required
						rows={4}
						class="w-full resize-none border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
					></textarea>
				</Field>

				{#if error}
					<Heading level={6} tag="p" class="mb-4 text-danger">{error}</Heading>
				{/if}

				<ArrowLink
					type="submit"
					variant="button"
					label={loading ? contactContent.form.submitLoadingLabel : contactContent.form.submitLabel}
					{loading}
					disabled={loading}
					class="mt-2"
				/>
			</form>
		{/if}
	</div>
</Section>
