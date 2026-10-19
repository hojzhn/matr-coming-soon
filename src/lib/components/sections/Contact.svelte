<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { contactContent, siteContent, studioContent } from '$lib/content';
	import { trackEvent } from '$lib/analytics/track';
	import { cn } from '$lib/cn';

	let { formToken }: { formToken: string } = $props();

	type Mode = 'general' | 'studio';
	const modes: Mode[] = ['general', 'studio'];
	const { studio } = contactContent;
	const tiers = studioContent.tiers;

	const params = page.url.searchParams;
	const requested = params.get('type');
	let mode = $state<Mode>(requested === 'studio' || requested === 'commission' ? 'studio' : 'general');
	let tier = $state(tiers.find((t) => t.id === params.get('tier'))?.id ?? tiers[0].id);
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let company = $state('');
	let surface = $state('');
	let timeline = $state('');

	function syncUrl() {
		const url = new URL(page.url);
		if (mode === 'studio') {
			url.searchParams.set('type', 'studio');
			url.searchParams.set('tier', tier);
		} else {
			url.searchParams.delete('type');
			url.searchParams.delete('tier');
		}
		replaceState(url, page.state);
	}

	function setMode(next: Mode) {
		if (next === mode) return;
		mode = next;
		syncUrl();
	}

	function setTier(next: string) {
		if (next === tier) return;
		tier = next;
		syncUrl();
	}

	function composeMessage() {
		if (mode === 'general') return message;
		const tierName = tiers.find((t) => t.id === tier)?.name ?? tier;
		const details = [
			`${studio.surfaceLabel}: ${surface.trim() || '-'}`,
			`${studio.timelineLabel}: ${timeline.trim() || '-'}`
		];
		return [`${studio.messageTitle}: ${tierName}`, ...details, '', message.trim()].join('\n');
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
				trackEvent(mode === 'studio' ? 'studio_form_submitted' : 'contact_form_submitted', mode === 'studio' ? { tier } : undefined);
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

{#snippet chip(label: string, selected: boolean, onclick: () => void)}
	<button
		type="button"
		{onclick}
		aria-pressed={selected}
		class={cn(
			'border-2 px-3 py-2 text-left transition-colors',
			selected ? 'border-ink' : 'border-line hover:border-ink-muted'
		)}
	>
		<Heading level={5} tag="span" weight="medium">{label}</Heading>
	</button>
{/snippet}

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

				{#if mode === 'studio'}
					<div transition:slide={{ duration: 300 }}>
						<Field label={studio.tierLabel}>
							<div class="mt-3 flex flex-wrap gap-2">
								{#each tiers as option (option.id)}
									{@render chip(option.name, tier === option.id, () => setTier(option.id))}
								{/each}
							</div>
						</Field>
						<Field label={studio.surfaceLabel} bind:value={surface} placeholder={studio.surfacePlaceholder} />
						<Field label={studio.timelineLabel} bind:value={timeline} placeholder={studio.timelinePlaceholder} />
					</div>
				{/if}

				<Field label={contactContent.form.messageLabel} required>
					<textarea
						bind:value={message}
						placeholder={mode === 'general' ? contactContent.form.messagePlaceholder : studio.messagePlaceholder}
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
