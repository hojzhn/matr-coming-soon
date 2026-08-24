<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import Field from '$lib/components/ui/Field.svelte';
	import SizeInput from '$lib/components/ui/SizeInput.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import StretchDiagram from '$lib/components/ui/StretchDiagram.svelte';
	import { orderContent } from '$lib/content';
	import {
		addOnOptions,
		STRETCH_SERVICE_OPTION_ID,
		OUTPAINT_OPTION_ID,
		MAX_PRINT_SIDE_IN,
		MARGIN_STEPS_IN,
		MARGIN_DEFAULT_IN
	} from '$lib/pricing/config';
	import { calculateOrderTotal, formatPrice, formatMarginStep, toInches } from '$lib/pricing/calculate';
	import { cart } from '$lib/cart/cart.svelte';
	import { submitCheckout } from '$lib/cart/checkout';
	import { toast } from '$lib/toast/toast.svelte';
	import { cn } from '$lib/cn';

	let { formToken }: { formToken: string } = $props();

	const REQUIRE_PROJECT_DETAILS = false;

	const MAX_FILE_BYTES = 50 * 1024 * 1024;
	const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

	let projectName = $state('');
	let error = $state('');
	let checkoutLoading = $state(false);
	let showConfirmation = $state(false);

	let customWidth = $state('');
	let customHeight = $state('');
	let customUnit = $state<'in' | 'cm'>('in');
	let selectedOptionIds = $state<string[]>([]);
	let marginIn = $state(MARGIN_DEFAULT_IN);
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

	const stretchSelected = $derived(selectedOptionIds.includes(STRETCH_SERVICE_OPTION_ID));

	function toggleOption(id: string) {
		if (selectedOptionIds.includes(id)) {
			selectedOptionIds = selectedOptionIds.filter((optionId) => optionId !== id);
			return;
		}
		selectedOptionIds = [...selectedOptionIds, id];
		if (id === STRETCH_SERVICE_OPTION_ID) {
			marginIn = MARGIN_DEFAULT_IN;
			if (!selectedOptionIds.includes(OUTPAINT_OPTION_ID)) {
				selectedOptionIds = [...selectedOptionIds, OUTPAINT_OPTION_ID];
			}
		}
	}

	$effect(() => {
		if (stretchSelected && (marginIn !== MARGIN_DEFAULT_IN || !selectedOptionIds.includes(OUTPAINT_OPTION_ID))) {
			selectedOptionIds = selectedOptionIds.filter((id) => id !== STRETCH_SERVICE_OPTION_ID);
		}
	});

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
		marginIn = MARGIN_DEFAULT_IN;
		quantity = '1';
		file = null;
		previewUrl = null;
		fileError = '';
		dragOver = false;
		if (fileInput) fileInput.value = '';
	}

	function validate(): boolean {
		error = '';

		if (REQUIRE_PROJECT_DETAILS && !projectName.trim()) {
			error = orderContent.form.errorProjectNameRequired;
			return false;
		}
		if (REQUIRE_PROJECT_DETAILS && !file) {
			error = orderContent.form.errorFileRequired;
			return false;
		}
		if (!activeSize) {
			error = orderContent.form.errorInvalidSize;
			return false;
		}
		if (exceedsMaxSize) {
			error = orderContent.form.errorMaxSize;
			return false;
		}
		return true;
	}

	function addItemToCart(): boolean {
		if (!validate() || !activeSize) return false;

		const result = cart.add({
			projectName,
			rawWidth: Number(customWidth),
			rawHeight: Number(customHeight),
			rawUnit: customUnit,
			widthIn: activeSize.widthIn,
			heightIn: activeSize.heightIn,
			optionIds: selectedOptionIds,
			marginIn,
			quantity: Number(quantity) || 1,
			fileName: file?.name ?? null,
			previewUrl
		});

		if (!result.ok) {
			error = orderContent.form.errorCartFull;
			return false;
		}

		return true;
	}

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!addItemToCart()) return;
		toast.show(orderContent.form.addedToCartToast);
		showConfirmation = true;
		setTimeout(() => {
			resetForm();
			showConfirmation = false;
		}, 1300);
	}

	async function checkoutNow() {
		if (!addItemToCart()) return;
		resetForm();
		checkoutLoading = true;
		const result = await submitCheckout(formToken);
		if (!result.ok) error = result.error;
		checkoutLoading = false;
	}
</script>

<div class="relative">
	<form
		class={cn(
			'mt-8 grid gap-10 transition-all duration-500 ease-out md:grid-cols-2',
			showConfirmation ? 'pointer-events-none blur-md opacity-0' : 'blur-none opacity-100'
		)}
		{onsubmit}
	>
		<div>
			<Heading level={5} tag="p" tone="muted" class="mb-4">Artwork *</Heading>
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
						<Heading level={6} tag="span" tone="muted" class="max-w-[80%] truncate">
							{file.name}
						</Heading>
					{:else}
						<Icon
							name="upload"
							class="h-7 w-7 text-ink-faint transition-colors group-hover:text-brand"
						/>
						<Heading level={5} tag="span" weight="medium" tone="muted">
							{orderContent.form.uploadLabel}
						</Heading>
						<Heading level={6} tag="span" tone="muted">{orderContent.form.uploadHint}</Heading>
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
				<Heading level={6} tag="p" tone="muted">{orderContent.form.uploadDpiNote}</Heading>
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
				<Heading level={6} tag="p" class="mt-1 text-danger">{fileError}</Heading>
			{/if}
		</div>

		<div class="flex flex-col gap-6">
			<Field
				label={orderContent.form.projectNameLabel}
				placeholder={orderContent.form.projectNamePlaceholder}
				required
				bind:value={projectName}
			/>

			<Field label={orderContent.form.sizeLabel}>
				<SizeInput bind:width={customWidth} bind:height={customHeight} bind:unit={customUnit} />

				{#if exceedsMaxSize}
					<Heading level={6} tag="p" class="mt-1.5 text-danger">
						{orderContent.form.errorMaxSize}
					</Heading>
				{/if}
			</Field>
	<Field label={orderContent.form.marginLabel} description={orderContent.form.marginDescription}>
				<div class="px-2 pt-4">
					<div class="relative">
						<div class="absolute inset-x-0 top-1.5 h-px bg-line"></div>
						<div class="relative flex items-center justify-between">
							{#each MARGIN_STEPS_IN as step (step)}
								{@const active = marginIn === step}
								<button
									type="button"
									onclick={() => (marginIn = step)}
									aria-pressed={active}
									aria-label={`${step} in`}
									class={cn(
										'flex h-4 w-4 items-center justify-center rounded-full border-2 bg-surface transition-colors',
										active ? 'border-ink' : 'border-ink-faint hover:border-ink-muted'
									)}
								>
									{#if active}
										<span class="h-2 w-2 rounded-full bg-ink"></span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
					<div class="mt-2 flex items-center justify-between">
						{#each MARGIN_STEPS_IN as step (step)}
						<div class="w-4 text-center">
							<Heading
								level={6}
								tag="span"
								weight={marginIn === step ? 'semibold' : 'normal'}
								tone={marginIn === step ? 'ink' : 'muted'}
							>
								{formatMarginStep(step)}″
							</Heading></div>
						{/each}
					</div>
				</div>
			</Field>
			<Field label={orderContent.form.optionsLabel} description={orderContent.form.optionsDescription}>
				<div class="flex flex-col gap-2 mt-4">
					{#each addOnOptions as opt (opt.id)}
						{@const selected = selectedOptionIds.includes(opt.id)}
						<button
							type="button"
							onclick={() => toggleOption(opt.id)}
							aria-pressed={selected}
							class={cn(
								'flex flex-col gap-2 border-2 p-3 text-center transition-colors',
								selected ? 'border-ink' : 'border-line hover:border-ink-muted'
							)}
						>
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-4">
									<Icon name={opt.icon} class="h-6 w-6 text-ink" strokeWidth={1} />
									<Heading level={4} tag="span" weight="medium">
										{opt.label}
									</Heading>
									{#if selected}
										<span
											class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink"
											transition:fade={{ duration: 150 }}
										>
											<Icon name="check" class="h-2.5 w-2.5 text-surface" strokeWidth={3} />
										</span>
									{/if}
								</div>
								<Heading level={3}>
									{opt.priceDeltaCents ? ` +${formatPrice(opt.priceDeltaCents)}` : ''}
								</Heading>
							</div>
							{#if selected && opt.description}
								<div class="text-left" transition:slide={{ duration: 250 }}>
									<Heading level={5} tag="p" tone="muted">
										{opt.description}
									</Heading>
								</div>
							{/if}
						</button>
					{/each}
				</div>

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
					<Heading level={5} tag="span" tone="muted">{orderContent.form.totalLabel}</Heading>
					<Heading level={2} tag="span">
						{total ? formatPrice(total.totalPriceCents) : '—'}
					</Heading>
				</div>
				{#if total}
					<Heading level={6} tag="p" tone="muted" class="mt-1">
						{total.quantity} x {projectName.trim() || orderContent.form.untitledLabel} ({formatPrice(total.basePriceCents)})
					</Heading>
					{#each total.options as opt (opt.id)}
						<Heading level={6} tag="p" tone="muted" class="ml-3">
							- {opt.label} ({formatPrice(opt.priceDeltaCents)})
						</Heading>
					{/each}
				{/if}
			</div>

			{#if error}
				<Heading level={6} tag="p" class="text-danger">{error}</Heading>
			{/if}

			<div class="flex flex-col gap-3 sm:flex-row">
				<ArrowLink
					type="submit"
					variant="button"
					icon="cart"
					arrow={false}
					label={orderContent.form.addToCartLabel}
					disabled={checkoutLoading}
					class="w-full sm:flex-1"
				/>
				<ArrowLink
					type="button"
					variant="button"
					icon="bolt"
					arrow={false}
					fill="ink"
					label={orderContent.form.checkoutNowLabel}
					loading={checkoutLoading}
					disabled={checkoutLoading}
					onclick={checkoutNow}
					class="w-full bg-brand sm:flex-1"
				/>
			</div>

			<div class="flex flex-col gap-2">
				{#each orderContent.form.finePrint as item (item.text)}
					<div class="flex items-center gap-2">
						<Icon name={item.icon as IconName} class="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
						<Heading level={6} tag="p" tone="muted">{item.text}</Heading>
					</div>
				{/each}
			</div>
		</div>
	</form>

	{#if showConfirmation}
		<div
			class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4"
			transition:fade={{ duration: 300 }}
		>
			<svg
				viewBox="0 0 24 24"
				class="h-14 w-14 text-ink"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" stroke-width="2" class="confirm-circle" />
				<path d="M8 12l3 3 5-6" stroke-width="2" class="confirm-check" />
			</svg>
			<Heading level={2}>{orderContent.form.addedToCartConfirmation}</Heading>
		</div>
	{/if}
</div>

<style>
	.confirm-circle {
		stroke-dasharray: 63;
		stroke-dashoffset: 63;
		animation: confirm-draw 450ms ease-out forwards;
	}
	.confirm-check {
		stroke-dasharray: 13;
		stroke-dashoffset: 13;
		animation: confirm-draw 300ms ease-out 400ms forwards;
	}
	@keyframes confirm-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
