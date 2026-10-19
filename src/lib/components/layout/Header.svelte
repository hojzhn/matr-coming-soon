<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import Container from '$lib/components/ui/Container.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import CartContents from '$lib/components/cart/CartContents.svelte';
	import { navContent, orderContent } from '$lib/content';
	import { cart } from '$lib/cart/cart.svelte';
	import { cn } from '$lib/cn';
	import { tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { smoothScrollIfSamePage } from '$lib/scroll';
	import { announcementState } from './announcement-state.svelte';

	let { formToken }: { formToken: string } = $props();

	let open = $state(false);
	let overDark = $state(true);

	let linkEls = $state<HTMLAnchorElement[]>([]);
	let indicator = $state({ x: 0, width: 0 });
	let indicatorReady = $state(false);
	const activeIndex = $derived(navContent.items.findIndex((item) => item.href === page.url.pathname));

	function measureIndicator() {
		const el = linkEls[activeIndex];
		if (!el) return;
		indicator = { x: el.offsetLeft, width: el.offsetWidth };
	}

	$effect(() => {
		activeIndex;
		measureIndicator();
		if (!indicatorReady) requestAnimationFrame(() => (indicatorReady = true));
	});

	$effect(() => {
		window.addEventListener('resize', measureIndicator);
		document.fonts?.ready.then(measureIndicator);
		return () => window.removeEventListener('resize', measureIndicator);
	});

	function close() {
		open = false;
	}

	function navigate(event: MouseEvent, href: string) {
		close();
		smoothScrollIfSamePage(event, href);
	}

	function toggleCart() {
		open = !open;
	}

	function updateOverDark() {
		overDark = [...document.querySelectorAll('#top, #handcrafted')].some((el) => {
			const r = el.getBoundingClientRect();
			return r.top < 64 && r.bottom > 64;
		});
	}

	$effect(() => {
		updateOverDark();
		window.addEventListener('scroll', updateOverDark, { passive: true });
		window.addEventListener('resize', updateOverDark);
		return () => {
			window.removeEventListener('scroll', updateOverDark);
			window.removeEventListener('resize', updateOverDark);
		};
	});

	afterNavigate(() => {
		tick().then(updateOverDark);
	});

	let hiddenByScroll = $state(false);

	$effect(() => {
		let lastY = window.scrollY;
		let skipNext = true;
		function onScroll() {
			const y = window.scrollY;
			if (skipNext) {
				skipNext = false;
			} else {
				hiddenByScroll = y > 0 && y > lastY;
			}
			lastY = y;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	const inkClass = $derived(overDark ? 'text-surface' : 'text-ink');
	const mobileTone = $derived(overDark && !open ? 'surface' : 'ink');
	const announcementShown = $derived(!announcementState.dismissed && !announcementState.hiddenByScroll);
</script>

<header
	class={cn(
		'fixed inset-x-0 z-50 w-full [view-transition-name:site-header] transition-[top,transform,background-color] duration-300 ease-out',
		overDark ? 'bg-transparent' : 'bg-surface',
		announcementShown ? 'top-6' : 'top-0',
		hiddenByScroll && !open ? 'max-md:-translate-y-full' : 'max-md:translate-y-0'
	)}
>
	<Container width="full">
		<div class="relative flex h-16 items-center justify-between">
			<a
				href="/"
				class={cn('flex items-end gap-2.5 transition-colors duration-300', inkClass, open && 'max-md:text-ink')}
				aria-label="matr labs, home"
				onclick={(e) => navigate(e, '/')}
			>
				<Logo class="h-7 w-auto" />
				<Heading tag="span" size="lg" weight="bold" leading="none" tracking="tighter" balance={false} class="whitespace-nowrap"
					>matr labs</Heading
				>
			</a>

			<nav class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
				{#each navContent.items as item, i (item.href)}
					<a
						bind:this={linkEls[i]}
						href={item.href}
						aria-current={i === activeIndex ? 'page' : undefined}
						onclick={(e) => smoothScrollIfSamePage(e, item.href)}
						class={cn(
							'text-sm font-medium transition-colors duration-300 hover:opacity-70',
							inkClass
						)}
					>
						{item.label}
					</a>
				{/each}
				<span
					aria-hidden="true"
					class={cn(
						'pointer-events-none absolute -bottom-1.5 left-0 h-0.5 bg-current',
						indicatorReady && 'transition-[translate,width,color,opacity] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
						activeIndex === -1 ? 'opacity-0' : 'opacity-100',
						inkClass
					)}
					style={`translate: ${indicator.x}px 0; width: ${indicator.width}px`}
				></span>
			</nav>

			<div class="flex items-center gap-4 md:gap-8">
				<button
					type="button"
					class="relative flex h-10 w-10 items-center justify-center"
					aria-label={cart.count > 0 ? `Cart, ${cart.count} item${cart.count === 1 ? '' : 's'}` : 'Cart'}
					aria-expanded={open}
					onclick={toggleCart}
				>
					<Icon name="cart" class={cn('h-5 w-5 transition-colors duration-300', inkClass, open && 'max-md:text-ink')} />
					{#if cart.count > 0}
						<span
							class="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-ink"
						>
							{cart.count}
						</span>
					{/if}
				</button>
			</div>
		</div>

		<nav class="flex h-9 items-center justify-between md:hidden" aria-label="Main">
			{#each navContent.items as item (item.href)}
				<a
					href={item.href}
					aria-current={item.href === page.url.pathname ? 'page' : undefined}
					onclick={(e) => navigate(e, item.href)}
					class="py-2"
				>
					<Heading
						tag="span"
						size="sm"
						weight={item.href === page.url.pathname ? 'bold' : 'medium'}
						tone={mobileTone}
						underline={item.href === page.url.pathname}
						balance={false}
						class="whitespace-nowrap transition-colors duration-300"
					>
						{item.label}
					</Heading>
				</a>
			{/each}
		</nav>
	</Container>
</header>

{#if open}
	<div class="fixed inset-0 z-[45] flex flex-col bg-surface px-container md:hidden" transition:fly={{ x: 40, duration: 250 }}>
		<div class="flex min-h-0 flex-1 flex-col pt-36 pb-6">
			<Heading level={2} class="mb-4 shrink-0">{orderContent.cart.heading}</Heading>
			<div class="min-h-0 flex-1">
				<CartContents {formToken} />
			</div>
		</div>
	</div>
{/if}

{#if open}
	<div class="fixed inset-0 z-[60] hidden md:block">
		<button
			type="button"
			class="absolute inset-0 bg-shade/10"
			aria-label="Close cart"
			onclick={close}
			transition:fade={{ duration: 200 }}
		></button>
		<aside
			class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface p-6 border-l-2 shadow-2xl"
			transition:fly={{ x: 320, duration: 300 }}
		>
			<div class="flex shrink-0 items-center justify-between border-b border-line pb-4">
				<Heading level={2}>{orderContent.cart.heading}</Heading>
				<button
					type="button"
					aria-label="Close cart"
					onclick={close}
					class="text-ink-faint transition-colors hover:text-ink"
				>
					<Icon name="close" class="h-5 w-5" />
				</button>
			</div>
			<div class="mt-4 min-h-0 flex-1">
				<CartContents {formToken} />
			</div>
		</aside>
	</div>
{/if}
