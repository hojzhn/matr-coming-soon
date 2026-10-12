<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { contactContent, siteContent, toolboxContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';

	let { formToken }: { formToken: string } = $props();

	type Mode = 'general' | 'commission';
	const modes: Mode[] = ['general', 'commission'];
	const { commission } = contactContent;
	const techniqueOptions = [...toolboxContent.techniques.map((t) => t.title), commission.unsureLabel];

	let mode = $state<Mode>(page.url.searchParams.get('type') === 'commission' ? 'commission' : 'general');
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let company = $state('');
	let techniques = $state<string[]>([]);
	let surface = $state('');
	let timeline = $state('');

	function setMode(next: Mode) {
		if (next === mode) return;
		mode = next;
		const url = new URL(page.url);
		if (next === 'commission') url.searchParams.set('type', 'commission');
		else url.searchParams.delete('type');
		replaceState(url, page.state);
	}

	function toggleTechnique(option: string) {
		techniques = techniques.includes(option)
			? techniques.filter((t) => t !== option)
			: [...techniques, option];
	}

	function composeMessage() {
		if (mode === 'general') return message;
		return [
			commission.messageTitle,
			`${commission.techniquesLabel}: ${techniques.length ? techniques.join(', ') : '-'}`,
			`${commission.surfaceLabel}: ${surface.trim() || '-'}`,
			`${commission.timelineLabel}: ${timeline.trim() || '-'}`,
			'',
			message.trim()
		].join('\n');
	}
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

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
				body: JSON.stringify({ name, email, message: composeMessage(), company, formToken })
			});
			const data = await res.json();
			if (data.ok) {
				success = true;
				trackEvent(mode === 'commission' ? 'commission_form_submitted' : 'contact_form_submitted');
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
	<div class="grid gap-10 md:grid-cols-2 md:gap-16">
		<div class="flex flex-col items-start gap-2">
			<Heading level={4} tag="h2">{contactContent.heading}</Heading>
			<ArrowLink
				href={`mailto:${siteContent.email}`}
				label={siteContent.email}
				icon="mail"
				arrow={false}
				size="base"
				sizeMd="md"
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

				<div class="mb-8 flex flex-wrap gap-x-8 gap-y-2" role="group" aria-label={contactContent.modesLabel}>
					{#each modes as option (option)}
						<button
							type="button"
							onclick={() => setMode(option)}
							aria-pressed={mode === option}
							class={cn(
								'text-left transition-opacity duration-300',
								mode === option ? 'opacity-100' : 'opacity-40 hover:opacity-100'
							)}
						>
							<Heading level={4} tag="span" weight="medium" underline={mode === option}>{contactContent.modes[option]}</Heading>
						</button>
					{/each}
				</div>

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

				{#if mode === 'commission'}
					<div transition:slide={{ duration: 300 }}>
						<Field label={commission.techniquesLabel}>
							<div class="mt-3 flex flex-wrap gap-2">
								{#each techniqueOptions as option (option)}
									{@const selected = techniques.includes(option)}
									<button
										type="button"
										onclick={() => toggleTechnique(option)}
										aria-pressed={selected}
										class={cn(
											'border-2 px-3 py-2 text-left transition-colors',
											selected ? 'border-ink' : 'border-line hover:border-ink-muted'
										)}
									>
										<Heading level={5} tag="span" weight="medium">{option}</Heading>
									</button>
								{/each}
							</div>
						</Field>
						<Field label={commission.surfaceLabel} bind:value={surface} placeholder={commission.surfacePlaceholder} />
						<Field label={commission.timelineLabel} bind:value={timeline} placeholder={commission.timelinePlaceholder} />
					</div>
				{/if}

				<Field label={contactContent.form.messageLabel} required>
					<textarea
						bind:value={message}
						placeholder={mode === 'commission' ? commission.messagePlaceholder : contactContent.form.messagePlaceholder}
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
