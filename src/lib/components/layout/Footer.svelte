<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import FooterColumn from './FooterColumn.svelte';
	import { navContent, siteContent, footerContent, newsletterContent } from '$lib/content';

	let { formToken }: { formToken: string } = $props();

	const year = new Date().getFullYear();

	let dateLabel = $state('—');
	let timeLabel = $state('—');

	function tick() {
		const now = new Date();
		const tz = footerContent.localTime.timeZone;
		dateLabel = now.toLocaleDateString('en-US', {
			timeZone: tz,
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		const time = now.toLocaleTimeString('en-US', {
			timeZone: tz,
			hour12: true,
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		});
		const tzName =
			new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
				.formatToParts(now)
				.find((part) => part.type === 'timeZoneName')?.value ?? '';
		timeLabel = `${time} (${tzName})`;
	}

	$effect(() => {
		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	});

	let email = $state('');
	let company = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			error = 'That email doesn’t look right.';
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, company, formToken })
			});
			const data = await res.json();
			if (data.ok) {
				success = true;
			} else {
				error = data.error || newsletterContent.errorGeneric;
			}
		} catch {
			error = newsletterContent.errorGeneric;
		} finally {
			loading = false;
		}
	}
</script>

<footer class="border-t border-line bg-surface text-ink">
	<Container width="full" class="py-16">
		<div class="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
			<FooterColumn heading={footerContent.headings.connect}>
				<ul class="flex flex-col gap-1">
					{#each footerContent.social as link (link.href)}
						<li>
							<ArrowLink href={link.href} label={link.label} external size="sm" sizeMd="lg" class="-ml-3" />
						</li>
					{/each}
				</ul>
			</FooterColumn>

			<FooterColumn heading={footerContent.headings.sayHello}>
				<div id="contact" class="space-y-2">
					<ArrowLink
						href={`mailto:${siteContent.email}`}
						label={siteContent.email}
						size="sm"
						sizeMd="lg"
						class="-ml-3"
					/>
					<Heading level={4} size="sm" sizeMd="lg" weight="medium">
						{footerContent.address.city}, {footerContent.address.region}
					</Heading>
				</div>
			</FooterColumn>

			<FooterColumn heading={footerContent.headings.localTime}>
				<div class="space-y-2">
					<Heading level={4} size="sm" sizeMd="lg" weight="medium">{dateLabel}</Heading>
					<Heading level={4} size="sm" sizeMd="lg" weight="medium">{timeLabel}</Heading>
				</div>
			</FooterColumn>

			<FooterColumn heading={footerContent.headings.index}>
				<ul class="flex flex-col gap-2">
					{#each navContent.items as item (item.href)}
						<li>
							<ArrowLink href={item.href} label={item.label} samepage arrow={false} size="sm" sizeMd="lg" class="-ml-3" />
						</li>
					{/each}
				</ul>
			</FooterColumn>
		</div>

		<hr class="my-12 border-0 border-t border-line" />

		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-end">
			<div>
				<div class="flex items-end gap-4 sm:gap-6">
					<Logo class="h-[clamp(2rem,4vw,4.25rem)] w-auto text-ink" />
					<Heading level={2} size="2xl" weight="bold" tracking="tight" leading="none">
						{siteContent.name}
					</Heading>
				</div>
				<Heading level={3} size="xs" weight="medium" tone="muted" class="mt-4">
					© {year} {siteContent.name}. {footerContent.legal.rights}.
				</Heading>
			</div>

			<div class="w-full sm:max-w-sm sm:justify-self-end">
				{#if success}
					<Heading level={4} size="sm" tone="brand">{newsletterContent.successMessage}</Heading>
				{:else}
					<form class="flex items-end gap-3" {onsubmit}>
						<input
							type="text"
							name="company"
							bind:value={company}
							tabindex="-1"
							autocomplete="off"
							class="hidden"
							aria-hidden="true"
						/>
						<div class="flex-1">
							<Field
								label={newsletterContent.heading}
								type="email"
								placeholder={newsletterContent.emailPlaceholder}
								bind:value={email}
							/>
						</div>
						<ArrowLink type="submit" label={newsletterContent.submitLabel} arrow={false} {loading} disabled={loading} class="mb-0.5" />
					</form>
					{#if error}
						<Heading level={4} size="xs" class="mt-2 text-danger">{error}</Heading>
					{/if}
				{/if}
			</div>
		</div>
	</Container>
</footer>
