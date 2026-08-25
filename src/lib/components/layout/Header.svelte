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
	import { announcementState } from './announcement-state.svelte';

	let { formToken }: { formToken: string } = $props();

	let open = $state(false);
	let mobileView = $state<'menu' | 'cart'>('menu');
	let overDark = $state(true);

	function close() {
		open = false;
		mobileView = 'menu';
	}

	function toggleMenu() {
		if (open && mobileView === 'menu') {
			close();
		} else {
			open = true;
			mobileView = 'menu';
		}
	}

	function toggleCart() {
		if (open && mobileView === 'cart') {
			close();
		} else {
			open = true;
			mobileView = 'cart';
		}
	}

	$effect(() => {
		const hero = document.getElementById('top');
		if (!hero) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				overDark = entry.isIntersecting;
			},
			{ rootMargin: '-64px 0px 0px 0px', threshold: 0 }
		);
		observer.observe(hero);
		return () => observer.disconnect();
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
	const announcementShown = $derived(!announcementState.dismissed && !announcementState.hiddenByScroll);
</script>

<header
	class={cn(
		'fixed inset-x-0 z-50 w-full transition-[top,transform] duration-300 ease-out',
		announcementShown ? 'top-6' : 'top-0',
		hiddenByScroll && !open ? 'max-md:-translate-y-full' : 'max-md:translate-y-0'
	)}
>
	<Container width="full">
		<div class="flex h-16 items-center justify-between">
			<a href="#top" class="flex items-center" aria-label="matr labs, back to top" onclick={close}>
				<Logo class={cn('h-7 w-auto transition-colors duration-300', inkClass, open && 'max-md:text-ink')} />
			</a>

			<div class="flex items-center gap-4 md:gap-8">
				<nav class="hidden items-center gap-8 md:flex">
					{#each navContent.items as item (item.href)}
						<a
							href={item.href}
							class={cn(
								'text-sm font-medium transition-colors duration-300 hover:opacity-70',
								inkClass
							)}
						>
							{item.label}
						</a>
					{/each}
				</nav>

				<button
					type="button"
					class="relative flex h-10 w-10 items-center justify-center"
					aria-label={cart.count > 0 ? `Cart, ${cart.count} item${cart.count === 1 ? '' : 's'}` : 'Cart'}
					aria-expanded={open && mobileView === 'cart'}
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

				<button
					type="button"
					class="flex h-10 w-10 items-center justify-center md:hidden"
					aria-label={open && mobileView === 'menu' ? 'Close menu' : 'Open menu'}
					aria-expanded={open && mobileView === 'menu'}
					onclick={toggleMenu}
				>
					<Icon name="menu" class={cn('h-6 w-6 transition-colors duration-300', inkClass, open && 'max-md:text-ink')} />
				</button>
			</div>
		</div>
	</Container>
</header>

{#if open}
	<div class="fixed inset-0 z-[45] flex flex-col bg-surface px-container md:hidden" transition:fly={{ x: 40, duration: 250 }}>
		{#if mobileView === 'menu'}
			<div class="flex flex-1 flex-col justify-center">
				<nav class="flex flex-col gap-6">
					{#each navContent.items as item (item.href)}
						<a href={item.href} onclick={close}>
							<Heading level={2}>{item.label}</Heading>
						</a>
					{/each}
					<button type="button" class="text-left" onclick={() => (mobileView = 'cart')}>
						<Heading level={2}>{orderContent.cart.menuLabel}</Heading>
					</button>
				</nav>
			</div>
		{:else}
			<div class="flex min-h-0 flex-1 flex-col pt-24 pb-6">
				<Heading level={2} class="mb-4 shrink-0">{orderContent.cart.heading}</Heading>
				<div class="min-h-0 flex-1">
					<CartContents {formToken} />
				</div>
			</div>
		{/if}
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
