<script lang="ts">
	import Field from '$lib/components/ui/Field.svelte';
	import SizeInput from '$lib/components/ui/SizeInput.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import StretchDiagram from '$lib/components/ui/StretchDiagram.svelte';
	import { orderContent } from '$lib/content';
	import {
		addOnOptions,
		sizingModes,
		NORMAL_SIZING_MODE,
		TO_STRETCH_SIZING_MODE,
		STRETCH_SERVICE_OPTION_ID,
		MAX_PRINT_SIDE_IN
	} from '$lib/pricing/config';
	import { calculateOrderTotal, resolveAddOns, formatPrice, toInches } from '$lib/pricing/calculate';
	import { cart } from '$lib/cart/cart.svelte';
	import { cn } from '$lib/cn';

	const MAX_FILE_BYTES = 50 * 1024 * 1024;
	const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

	let projectName = $state('');
	let error = $state('');

	let customWidth = $state('');
	let customHeight = $state('');
	let customUnit = $state<'in' | 'cm'>('in');
	let selectedOptionIds = $state<string[]>([]);
	let pendingOptionId = $state('');
	let sizingMode = $state(NORMAL_SIZING_MODE);
	let quantity = $state('1');

	let fileInput = $state<HTMLInputElement>();
	let file = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let imageAspect = $state<number | null>(null);
	let fileError = $state('');
	let dragOver = $state(false);

	const activeSize = $derived.by(() => {
		const w = Number(customWidth);
		const h = Number(customHeight);
		if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
		return { widthIn: toInches(w, customUnit), heightIn: toInches(h, customUnit) };
	});

	const exceedsMaxSize = $derived(
		activeSize
			? activeSize.widthIn > MAX_PRINT_SIDE_IN || activeSize.heightIn > MAX_PRINT_SIDE_IN
			: false
	);

	const availableOptions = $derived(addOnOptions.filter((o) => !selectedOptionIds.includes(o.id)));
	const selectedOptions = $derived(resolveAddOns(selectedOptionIds));

	const total = $derived.by(() => {
		if (!activeSize || exceedsMaxSize) return null;
		return calculateOrderTotal(activeSize.widthIn, activeSize.heightIn, selectedOptionIds, Number(quantity) || 1);
	});

	const boundingBoxStyle = $derived.by(() => {
		if (!activeSize) return 'width:100%;height:100%;';
		const { widthIn: w, heightIn: h } = activeSize;
		const printAspect = w / h;

		if (!imageAspect) {
			const ratio = `aspect-ratio:${w}/${h};`;
			return printAspect >= 1 ? `width:100%;${ratio}` : `height:100%;${ratio}`;
		}

		const imgW = imageAspect >= 1 ? 100 : 100 * imageAspect;
		const imgH = imageAspect >= 1 ? 100 / imageAspect : 100;
		const boxW = printAspect >= imageAspect ? imgW : imgH * printAspect;
		const boxH = printAspect >= imageAspect ? imgW / printAspect : imgH;

		return `width:${boxW}%;height:${boxH}%;`;
	});

	const formHeading = $derived(
		projectName.trim()
			? orderContent.form.formHeadingProjectTemplate.replace('{name}', projectName.trim())
			: orderContent.form.formHeading
	);

	function addOption() {
		if (!pendingOptionId || selectedOptionIds.includes(pendingOptionId)) return;
		selectedOptionIds = [...selectedOptionIds, pendingOptionId];
		if (pendingOptionId === STRETCH_SERVICE_OPTION_ID) {
			sizingMode = TO_STRETCH_SIZING_MODE;
		}
		pendingOptionId = '';
	}

	function removeOption(id: string) {
		selectedOptionIds = selectedOptionIds.filter((optionId) => optionId !== id);
	}

	function selectSizingMode(id: string) {
		sizingMode = id;
		if (id !== TO_STRETCH_SIZING_MODE) {
			selectedOptionIds = selectedOptionIds.filter((optionId) => optionId !== STRETCH_SERVICE_OPTION_ID);
		}
	}

	function setFile(next: File | null) {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		imageAspect = null;
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

	function onPreviewLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		imageAspect = img.naturalWidth / img.naturalHeight;
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

	function resetForm() {
		projectName = '';
		customWidth = '';
		customHeight = '';
		customUnit = 'in';
		selectedOptionIds = [];
		pendingOptionId = '';
		sizingMode = NORMAL_SIZING_MODE;
		quantity = '1';
		file = null;
		previewUrl = null;
		fileError = '';
		dragOver = false;
		if (fileInput) fileInput.value = '';
	}

	function onsubmit(e: SubmitEvent) {
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

		const result = cart.add({
			projectName,
			rawWidth: Number(customWidth),
			rawHeight: Number(customHeight),
			rawUnit: customUnit,
			widthIn: activeSize.widthIn,
			heightIn: activeSize.heightIn,
			optionIds: selectedOptionIds,
			sizingMode,
			quantity: Number(quantity) || 1,
			fileName: file?.name ?? null,
			previewUrl
		});

		if (!result.ok) {
			error = orderContent.form.errorCartFull;
			return;
		}

		resetForm();
	}
</script>

<div>
	
	<form class="mt-8 grid gap-10 md:grid-cols-2" {onsubmit}>
		<div>
			<Heading level={5} tag="p" eyebrow uppercase class="mb-4">Artwork</Heading>
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
						<img
							src={previewUrl}
							alt=""
							onload={onPreviewLoad}
							class="absolute inset-0 h-full w-full object-contain"
						/>
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

			<Field label={orderContent.form.sizeLabel}>
				<SizeInput bind:width={customWidth} bind:height={customHeight} bind:unit={customUnit} />

				{#if exceedsMaxSize}
					<Heading level={5} tag="p" size="xs" class="mt-1.5 text-danger">
						{orderContent.form.errorMaxSize}
					</Heading>
				{/if}
			</Field>

			<Field label={orderContent.form.sizingModeLabel}>
				<div class="grid grid-cols-2 gap-2">
					{#each sizingModes as mode (mode.id)}
						{@const active = sizingMode === mode.id}
						<button
							type="button"
							onclick={() => selectSizingMode(mode.id)}
							aria-pressed={active}
							class={cn(
								'border px-3 py-2 text-left transition-colors',
								active ? 'border-ink bg-ink' : 'border-line hover:border-ink'
							)}
						>
							<Heading level={4} tag="span" size="sm" weight="medium" tone={active ? 'surface' : 'ink'}>
								{mode.label}
							</Heading>
						</button>
					{/each}
				</div>

				{#if sizingMode === TO_STRETCH_SIZING_MODE}
					<StretchDiagram />
				{/if}
			</Field>

			<Field label={orderContent.form.optionsLabel}>
				<select
					bind:value={pendingOptionId}
					onchange={addOption}
					class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors focus:border-brand"
				>
					<option value="" disabled>{orderContent.form.optionsPlaceholder}</option>
					{#each availableOptions as opt (opt.id)}
						<option value={opt.id}>
							{opt.label}{opt.priceDeltaCents ? ` +${formatPrice(opt.priceDeltaCents)}` : ''}
						</option>
					{/each}
				</select>

				{#if selectedOptions.length}
					<div class="mt-2 flex flex-col gap-1.5">
						{#each selectedOptions as opt (opt.id)}
							<div class="flex items-center justify-between gap-2">
								<Heading level={5} tag="span" size="xs">
									{opt.label} ({formatPrice(opt.priceDeltaCents)})
								</Heading>
								<button
									type="button"
									onclick={() => removeOption(opt.id)}
									aria-label={orderContent.form.optionsRemoveLabel}
									class="shrink-0 text-ink-faint transition-colors hover:text-ink"
								>
									<Icon name="close" class="h-3.5 w-3.5" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</Field>

			<Field label={orderContent.form.quantityLabel}>
				<input
					type="number"
					min="1"
					inputmode="numeric"
					bind:value={quantity}
					class="w-full border-b-2 border-ink bg-transparent px-0 py-2.5 text-base font-medium text-ink outline-none transition-colors [appearance:textfield] focus:border-brand [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
			</Field>

			<div class="border-t border-line pt-4">
				<div class="flex items-center justify-between">
					<Heading level={4} tag="span" size="sm" tone="muted">{orderContent.form.totalLabel}</Heading>
					<Heading level={3} tag="span" size="lg">
						{total ? formatPrice(total.totalPriceCents) : '—'}
					</Heading>
				</div>
				{#if total}
					<Heading level={5} tag="p" size="xs" tone="muted" class="mt-1">
						{total.quantity} x {projectName.trim() || orderContent.form.untitledLabel} ({formatPrice(total.basePriceCents)})
					</Heading>
					{#each total.options as opt (opt.id)}
						<Heading level={5} tag="p" size="xs" tone="muted" class="ml-3">
							- {opt.label} ({formatPrice(opt.priceDeltaCents)})
						</Heading>
					{/each}
				{/if}
			</div>

			{#if error}
				<Heading level={4} tag="p" size="xs" class="text-danger">{error}</Heading>
			{/if}

			<ArrowLink type="submit" variant="button" label={orderContent.form.addToCartLabel} class="w-full" />

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
