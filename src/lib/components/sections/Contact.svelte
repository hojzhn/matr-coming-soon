<script lang="ts">
	import Section from '$lib/components/ui/Section.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LazyImage from '$lib/components/ui/LazyImage.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { contactContent } from '$lib/content';

	let { formToken }: { formToken: string } = $props();

	const contactImageSrc = '/images/contact.jpg';

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

<Section id="contact" tone="surface" fullHeight class="md:mb-40">
	<div class="flex w-full flex-col py-0 h-full md:pb-20">
	<div class="flex flex-row justify-between items-center mb-2">
		<Icon name="mail" class="h-6 w-6 text-ink" />
		<Heading level={4}>hello@matr.art</Heading>
	</div>
		<LazyImage
			src={contactImageSrc}
			alt=""
			class="w-full shrink-0 object-contain"
		/>
		{#if success}
		<div class="mt-8 w-full text-right">
			<Heading level={3}>
				{contactContent.form.successMessage}
			</Heading>
		</div>
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

				<div class="flex flex-col gap-4 md:flex-row md:gap-8 mt-8">
				<Heading level={3} tag="p" balance={false} class="flex flex-nowrap flex-col items-baseline gap-x-3 gap-y-2">
					<input
						type="text"
						bind:value={name}
						placeholder={contactContent.form.namePlaceholder}
						required
						autocomplete="name"
						class="min-w-20 md:max-w-md bg-transparent px-0 outline-none transition-colors placeholder:text-ink-faint "
					/>
					<div>{'<'}
					<input
						type="email"
						bind:value={email}
						placeholder={contactContent.form.emailPlaceholder}
						required
						autocomplete="email"
						class="field-sizing-content max-w-full min-w-20 bg-transparent px-0 outline-none transition-colors placeholder:text-ink-faint"
					/>
					{'>'}</div>
					</Heading>

					<Heading level={3} tag="p" balance={false} class="w-full">
						<textarea
							bind:value={message}
							placeholder={contactContent.form.messagePlaceholder}
							required
							rows={4}
							class="w-full resize-none bg-transparent p-0 outline-none placeholder:text-ink-faint"
						></textarea>
					</Heading>
					</div>

					

				{#if error}
					<Heading level={6} tag="p" class="text-danger">{error}</Heading>
				{/if}

				<div class="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-end">
				

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
