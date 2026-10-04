<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import { toolboxContent, contactContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { isValidEmail, submitContact } from '$lib/contact/submit';

	let { formToken }: { formToken: string } = $props();

	const { commission } = toolboxContent;
	const options = [...toolboxContent.techniques.map((t) => t.title), commission.unsureLabel];

	let name = $state('');
	let email = $state('');
	let techniques = $state<string[]>([]);
	let surface = $state('');
	let timeline = $state('');
	let message = $state('');
	let company = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	const inputClass =
		'w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand';

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!isValidEmail(email)) {
			error = contactContent.form.errorInvalidEmail;
			return;
		}

		const body = [
			commission.messageTitle,
			`${commission.techniquesLabel}: ${techniques.length ? techniques.join(', ') : '-'}`,
			`${commission.surfaceLabel}: ${surface.trim() || '-'}`,
			`${commission.timelineLabel}: ${timeline.trim() || '-'}`,
			'',
			message.trim()
		].join('\n');

		loading = true;
		const result = await submitContact({ name, email, message: body, company, formToken });
		loading = false;

		if (result.ok) {
			success = true;
			trackEvent('commission_form_submitted');
		} else {
			error = result.error || contactContent.form.errorGeneric;
		}
	}
</script>

<Section id="commission" tone="canvas" class="py-16 md:py-24">
	<div class="grid gap-10 md:grid-cols-2 md:gap-16">
		<div class="flex flex-col items-start gap-4">
			<Heading level={1} tag="h2">{commission.heading}</Heading>
			<Heading level={3} tag="p" weight="medium" tone="muted" balance={false}>
				{commission.body}
			</Heading>
		</div>

		{#if success}
			<Heading level={3}>{commission.successMessage}</Heading>
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
					label={commission.nameLabel}
					bind:value={name}
					placeholder={commission.namePlaceholder}
					autocomplete="name"
					required
				/>
				<Field
					label={commission.emailLabel}
					type="email"
					bind:value={email}
					placeholder={commission.emailPlaceholder}
					autocomplete="email"
					required
				/>
				<Field label={commission.techniquesLabel}>
					<div class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
						{#each options as option (option)}
							<label class="flex cursor-pointer items-start gap-3">
								<input
									type="checkbox"
									value={option}
									bind:group={techniques}
									class="mt-1 h-4 w-4 shrink-0 accent-brand-accent"
								/>
								<Heading level={5} tag="span" size="base" weight="medium">{option}</Heading>
							</label>
						{/each}
					</div>
				</Field>
				<Field
					label={commission.surfaceLabel}
					bind:value={surface}
					placeholder={commission.surfacePlaceholder}
				/>
				<Field
					label={commission.timelineLabel}
					bind:value={timeline}
					placeholder={commission.timelinePlaceholder}
				/>
				<Field label={commission.messageLabel} required>
					<textarea
						bind:value={message}
						placeholder={commission.messagePlaceholder}
						required
						rows={4}
						class={`${inputClass} resize-none`}
					></textarea>
				</Field>

				{#if error}
					<Heading level={6} tag="p" class="mb-4 text-danger">{error}</Heading>
				{/if}

				<ArrowLink
					type="submit"
					variant="button"
					label={loading ? commission.submitLoadingLabel : commission.submitLabel}
					{loading}
					disabled={loading}
					class="mt-2"
				/>
			</form>
		{/if}
	</div>
</Section>
