<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { contactContent, siteContent } from '$lib/content';

	let { formToken }: { formToken: string } = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let company = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	let committedName = $state('');
	let committedEmail = $state('');

	const headline = $derived(
		committedEmail.trim()
			? contactContent.headingWithEmail
			: committedName.trim()
				? contactContent.headingWithName.replace('{name}', committedName.trim())
				: contactContent.heading
	);

	let copyLabel = $state(contactContent.form.copyEmailLabel);

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(siteContent.email);
			copyLabel = contactContent.form.copiedLabel;
			setTimeout(() => (copyLabel = contactContent.form.copyEmailLabel), 1500);
		} catch {
			/* clipboard unavailable */
		}
	}

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			error = contactContent.form.errorInvalidEmail;
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, company, formToken })
			});
			const data = await res.json();
			if (data.ok) {
				success = true;
			} else {
				error = data.error || contactContent.form.errorGeneric;
			}
		} catch {
			error = contactContent.form.errorGeneric;
		} finally {
			loading = false;
		}
	}
</script>

<Section id="contact" tone="surface">
	<div class="grid w-full gap-12 md:grid-cols-2 md:items-start">
		<div class="flex h-full flex-col gap-8">
		
			{#key headline}
				<Heading level={2} size="2xl">{headline}</Heading>
			{/key}
		<Heading level={2} tag="p" size="sm" sizeMd="lg" weight="medium" balance={false} >
				{contactContent.intro}
			</Heading>
		</div>

		{#if success}
			<Heading level={2} size="lg" tone="brand" class="self-center">
				{contactContent.form.successMessage}
			</Heading>
		{:else}
			<form class="grid gap-8" {onsubmit}>
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
					placeholder={contactContent.form.namePlaceholder}
					bind:value={name}
					required
					autocomplete="name"
					onblur={() => (committedName = name)}
				/>

				<Field
					label={contactContent.form.emailLabel}
					type="email"
					placeholder={contactContent.form.emailPlaceholder}
					bind:value={email}
					required
					autocomplete="email"
					onblur={() => (committedEmail = email)}
				/>

				<Field label={contactContent.form.messageLabel}>
					<textarea
						bind:value={message}
						placeholder={contactContent.form.messagePlaceholder}
						required
						rows={4}
						class="w-full resize-none border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
					></textarea>
				</Field>

				{#if error}
					<Heading level={4} tag="p" size="xs" class="text-danger">{error}</Heading>
				{/if}

				<div class="flex flex-wrap items-center gap-6">
					<ArrowLink
						type="submit"
						variant="button"
						label={loading ? contactContent.form.submitLoadingLabel : contactContent.form.submitLabel}
						{loading}
						disabled={loading}
					/>
					<ArrowLink label={copyLabel} arrow={false} onclick={copyEmail} />
				</div>
			</form>
		{/if}
	</div>
</Section>
