<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { contactContent } from '$lib/content';

	let { formToken }: { formToken: string } = $props();

	const contactVideoSrc = '/videos/contact.mp4';

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

<Section id="contact" tone="surface" fullHeight>
	<div class="flex w-full flex-col gap-12 py-0 h-full md:pb-20">
		<video
			src={contactVideoSrc}
			autoplay
			muted
			loop
			playsinline
			class="w-full shrink-0 object-contain contrast-110 brightness-140"
		></video>

		{#if success}
			<Heading level={2} size="lg" tone="brand" class="flex flex-1 min-h-0 items-center">
				{contactContent.form.successMessage}
			</Heading>
		{:else}
			<form class="flex flex-1 min-h-0 flex-col justify-center gap-8" {onsubmit}>
				<input
					type="text"
					name="company"
					bind:value={company}
					tabindex="-1"
					autocomplete="off"
					class="hidden"
					aria-hidden="true"
				/>

				<Heading
					level={2}
					tag="p"
					size="xl"
					sizeMd="2xl"
					weight="semibold"
					tracking="tight"
					balance={false}
					class="flex flex-wrap items-baseline gap-x-3 gap-y-2"
				>
					<span>{contactContent.form.madlibGreeting}</span>
					<input
						type="text"
						bind:value={name}
						placeholder={contactContent.form.namePlaceholder}
						required
						autocomplete="name"
						class="min-w-20 max-w-70 field-sizing-content border-b-2 border-ink bg-transparent px-0 pb-1 outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
					/>
					<span>,</span>
					</Heading>
					<textarea
						bind:value={message}
						placeholder={contactContent.form.messagePlaceholder}
						required
						rows={4}
						class="w-full leading-tight resize-none bg-transparent px-0 py-1 text-md font-medium tracking-tight text-ink outline-none placeholder:text-ink-faint md:text-lg"
					></textarea>

					

				{#if error}
					<Heading level={4} tag="p" size="xs" class="text-danger">{error}</Heading>
				{/if}

				<div class="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between">
				<div class="flex flex-row items-baseline">
				<Heading
			level={4}
			tag="p"
			size="base"
			sizeMd="lg"
			weight="medium"
			tracking="tight"
			tone="ink"
			class="md:max-w-2xl"
		>
					<span>{contactContent.form.madlibClosing}</span>
					<input
						type="email"
						bind:value={email}
						placeholder={contactContent.form.emailPlaceholder}
						required
						autocomplete="email"
						class="w-56 border-b-2 border-ink bg-transparent px-0 md:ml-2 pb-1 outline-none transition-colors placeholder:text-ink-faint focus:border-brand"
					/>
					<span>.</span>
					</Heading>
				</div>

				<ArrowLink
					type="submit"
					variant="button"
					label={loading ? contactContent.form.submitLoadingLabel : contactContent.form.submitLabel}
					{loading}
					disabled={loading}
				/>
				</div>
			</form>
		{/if}
	</div>
</Section>
