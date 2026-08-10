<script lang="ts">
	import Field from '$lib/components/ui/Field.svelte';
	import SizeInput from '$lib/components/ui/SizeInput.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import { orderContent } from '$lib/content';
	import { sizePresets, finishOptions, MAX_PRINT_SIDE_IN } from '$lib/pricing/config';
	import { calculateOrderTotal, calculatePriceCents, formatPrice, toInches } from '$lib/pricing/calculate';
	import { cn } from '$lib/cn';

	let { formToken }: { formToken: string } = $props();

	const MAX_FILE_BYTES = 50 * 1024 * 1024;
	const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

	let projectName = $state('');
	let company = $state('');
	let loading = $state(false);
	let error = $state('');

	let selectedPreset = $state(0);
	let useCustomSize = $state(false);
	let customWidth = $state('');
	let customHeight = $state('');
	let customUnit = $state<'in' | 'cm'>('in');
	let finishId = $state(finishOptions[0].id);
	let quantity = $state('1');

	let fileInput = $state<HTMLInputElement>();
	let file = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let fileError = $state('');
	let dragOver = $state(false);

	const activeSize = $derived.by(() => {
		if (useCustomSize) {
			const w = Number(customWidth);
			const h = Number(customHeight);
			if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
			return { widthIn: toInches(w, customUnit), heightIn: toInches(h, customUnit) };
		}
		const preset = sizePresets[selectedPreset];
		return { widthIn: preset.widthIn, heightIn: preset.heightIn };
	});

	const exceedsMaxSize = $derived(
		activeSize
			? activeSize.widthIn > MAX_PRINT_SIDE_IN || activeSize.heightIn > MAX_PRINT_SIDE_IN
			: false
	);

	const total = $derived.by(() => {
		if (!activeSize || exceedsMaxSize) return null;
		return calculateOrderTotal(activeSize.widthIn, activeSize.heightIn, finishId, Number(quantity) || 1);
	});

	const boundingBoxStyle = $derived.by(() => {
		if (!activeSize) return 'width:100%;height:100%;';
		const { widthIn: w, heightIn: h } = activeSize;
		const ratio = `aspect-ratio:${w}/${h};`;
		return w >= h ? `width:100%;${ratio}` : `height:100%;${ratio}`;
	});

	const formHeading = $derived(
		projectName.trim()
			? orderContent.form.formHeadingProjectTemplate.replace('{name}', projectName.trim())
			: orderContent.form.formHeading
	);

	function presetPrice(widthIn: number, heightIn: number): number {
		return calculatePriceCents(widthIn, heightIn).priceCents;
	}

	function selectPreset(i: number) {
		selectedPreset = i;
		useCustomSize = false;
	}

	function setFile(next: File | null) {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		fileError = '';
		file = null;
		if (!next) return;

		if (!ACCEPTED_TYPES.includes(next.type) || next.size > MAX_FILE_BYTES) {
			fileError = orderContent.form.errorInvalidFile;
			return;
		}

		file = next;
		if (next.type.startsWith('image/')) previewUrl = URL.createObjectURL(next);
	}

	function onFileChange(e: Event) {
		setFile((e.currentTarget as HTMLInputElement).files?.[0] ?? null);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		setFile(e.dataTransfer?.files?.[0] ?? null);
	}

	function removeFile() {
		setFile(null);
		if (fileInput) fileInput.value = '';
	}

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!activeSize) {
			error = orderContent.form.errorInvalidSize;
			return;
		}
		if (exceedsMaxSize) {
			error = orderContent.form.errorMaxSize;
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectName,
					rawWidth: useCustomSize ? Number(customWidth) : sizePresets[selectedPreset].widthIn,
					rawHeight: useCustomSize ? Number(customHeight) : sizePresets[selectedPreset].heightIn,
					rawUnit: useCustomSize ? customUnit : 'in',
					finishId,
					quantity: Number(quantity) || 1,
					company,
					formToken
				})
			});
			const data = await res.json();
			if (data.ok && data.invoiceUrl) {
				window.location.href = data.invoiceUrl;
				return;
			}
			error = data.error || orderContent.form.errorGeneric;
		} catch {
			error = orderContent.form.errorGeneric;
		} finally {
			loading = false;
		}
	}
</script>

<div>
	
	<form class="mt-8 grid gap-10 md:grid-cols-2" {onsubmit}>
		<input
			type="text"
			name="company"
			bind:value={company}
			tabindex="-1"
			autocomplete="off"
			class="hidden"
			aria-hidden="true"
		/>

		<div>
			<Heading level={5} tag="p" eyebrow uppercase class="mb-1.5">Artwork</Heading>
			<div class="relative aspect-square w-full overflow-hidden bg-fill-soft/60">
				<button
					type="button"
					onclick={() => fileInput?.click()}
					ondragover={(e) => {
						e.preventDefault();
						dragOver = true;
					}}
					ondragleave={() => (dragOver = false)}
					ondrop={onDrop}
					class={cn(
						'group absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden p-4 text-center transition-colors',
						previewUrl ? 'bg-fill-soft' : 'border-2 border-dashed border-line bg-fill-soft',
						dragOver && !previewUrl && 'border-brand bg-surface'
					)}
				>
					{#if previewUrl}
						<img src={previewUrl} alt="" class="absolute inset-0 h-full w-full object-cover" />
					{:else if file}
						<Icon name="file" class="h-8 w-8 text-ink-muted" />
						<Heading level={5} tag="span" size="xs" tone="muted" class="max-w-[80%] truncate">
							{file.name}
						</Heading>
					{:else}
						<Icon
							name="upload"
							class="h-7 w-7 text-ink-faint transition-colors group-hover:text-brand"
						/>
						<Heading level={4} tag="span" size="sm" weight="medium" tone="muted">
							{orderContent.form.uploadLabel}
						</Heading>
						<Heading level={5} tag="span" size="xs" tone="muted">{orderContent.form.uploadHint}</Heading>
					{/if}
				</button>

				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div class="border-2 border-dashed border-brand" style={boundingBoxStyle}></div>
				</div>
			</div>
			<input
				bind:this={fileInput}
				type="file"
				accept="image/jpeg,image/png,application/pdf"
				class="hidden"
				onchange={onFileChange}
			/>

			<div class="mt-3 flex items-center justify-between gap-3">
				<Heading level={5} tag="p" size="xs" tone="muted">{orderContent.form.uploadDpiNote}</Heading>
				{#if file}
					<button
						type="button"
						onclick={removeFile}
						class="shrink-0 text-xs font-medium text-ink-muted underline hover:text-ink"
					>
						{orderContent.form.uploadRemoveLabel}
					</button>
				{/if}
			</div>
			{#if fileError}
				<Heading level={5} tag="p" size="xs" class="mt-1 text-danger">{fileError}</Heading>
			{/if}
		</div>

		<div class="flex flex-col gap-6">
			<Field
				label={orderContent.form.projectNameLabel}
				placeholder={orderContent.form.projectNamePlaceholder}
				bind:value={projectName}
			/>

			<div>
				<Heading level={5} tag="p" eyebrow class="mb-1.5">{orderContent.form.sizeLabel}</Heading>
				<div class="grid grid-cols-2 gap-2">
					{#each sizePresets as preset, i (preset.label)}
						{@const active = !useCustomSize && selectedPreset === i}
						<button
							type="button"
							onclick={() => selectPreset(i)}
							aria-pressed={active}
							class={cn(
								'border px-3 py-2 text-left transition-colors',
								active ? 'border-ink bg-ink' : 'border-line hover:border-ink'
							)}
						>
							<Heading level={4} tag="span" size="sm" weight="medium" tone={active ? 'surface' : 'ink'} class="block">
								{preset.label}
							</Heading>
							<Heading level={5} tag="span" size="xs" tone={active ? 'surface' : 'muted'} class="block">
								{formatPrice(presetPrice(preset.widthIn, preset.heightIn))}
							</Heading>
						</button>
					{/each}
					<button
						type="button"
						onclick={() => (useCustomSize = true)}
						aria-pressed={useCustomSize}
						class={cn(
							'col-span-2 border px-3 py-2 text-left transition-colors',
							useCustomSize ? 'border-ink bg-ink' : 'border-line hover:border-ink'
						)}
					>
						<Heading level={4} tag="span" size="sm" weight="medium" tone={useCustomSize ? 'surface' : 'ink'}>
							{orderContent.form.customSizeLabel}
						</Heading>
					</button>
				</div>

				{#if useCustomSize}
					<div class="mt-3">
						<SizeInput bind:width={customWidth} bind:height={customHeight} bind:unit={customUnit} />
					</div>
				{/if}

				{#if exceedsMaxSize}
					<Heading level={5} tag="p" size="xs" class="mt-1.5 text-danger">
						{orderContent.form.errorMaxSize}
					</Heading>
				{/if}
			</div>

			<div>
				<Heading level={5} tag="span" eyebrow uppercase class="mb-1.5 block">{orderContent.form.finishLabel}</Heading>
				<select
					bind:value={finishId}
					class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors focus:border-brand"
				>
					{#each finishOptions as opt (opt.id)}
						<option value={opt.id}>{opt.label} +{formatPrice(opt.priceDeltaCents)}</option>
					{/each}
				</select>
			</div>

			<div>
				<Heading level={5} tag="span" eyebrow uppercase class="mb-1.5 block">{orderContent.form.quantityLabel}</Heading>
				<input
					type="number"
					min="1"
					inputmode="numeric"
					bind:value={quantity}
					class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors [appearance:textfield] focus:border-brand [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
			</div>

			<div class="border-t border-line pt-4">
				<div class="flex items-center justify-between">
					<Heading level={4} tag="span" size="sm" tone="muted">{orderContent.form.totalLabel}</Heading>
					<Heading level={3} tag="span" size="lg">
						{total ? formatPrice(total.totalPriceCents) : '—'}
					</Heading>
				</div>
				{#if total}
					<Heading level={5} tag="p" size="xs" tone="muted" class="mt-1">
						{total.quantity} x print ({formatPrice(total.unitPriceCents)}, {total.finish.label})
					</Heading>
				{/if}
			</div>

			{#if error}
				<Heading level={4} tag="p" size="xs" class="text-danger">{error}</Heading>
			{/if}

			<ArrowLink
				type="submit"
				variant="button"
				label={loading ? orderContent.form.submitLoadingLabel : orderContent.form.submitLabel}
				{loading}
				disabled={loading}
				class="w-full"
			/>

			<div class="flex flex-col gap-2">
				{#each orderContent.form.finePrint as item (item.text)}
					<div class="flex items-start gap-2">
						<Icon name={item.icon as IconName} class="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
						<Heading level={5} tag="p" size="xs" tone="muted">{item.text}</Heading>
					</div>
				{/each}
			</div>
		</div>
	</form>
</div>
