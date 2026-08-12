<script lang="ts">
	import Container from '$lib/components/ui/Container.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { navContent } from '$lib/content';
	import { cart } from '$lib/cart/cart.svelte';
	import { cn } from '$lib/cn';

	let open = $state(false);
	let overDark = $state(true);

	function close() {
		open = false;
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

	const inkClass = $derived(overDark ? 'text-surface' : 'text-ink');
</script>

<header class="fixed inset-x-0 top-0 z-50 w-full">
	<Container width="full">
		<div class="flex h-16 items-center justify-between">
			<a href="#top" class="flex items-center" aria-label="matr labs, back to top" onclick={close}>
				<Logo class={cn('h-7 w-auto transition-colors duration-300', inkClass)} />
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

				<a
					href="#order"
					class="relative flex h-10 w-10 items-center justify-center"
					aria-label={cart.count > 0 ? `Cart, ${cart.count} item${cart.count === 1 ? '' : 's'}` : 'Cart'}
					onclick={close}
				>
					<Icon name="cart" class={cn('h-5 w-5 transition-colors duration-300', inkClass)} />
					{#if cart.count > 0}
						<span
							class="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-ink"
						>
							{cart.count}
						</span>
					{/if}
				</a>

				<button
					type="button"
					class="flex h-10 w-10 items-center justify-center md:hidden"
					aria-label={open ? 'Close menu' : 'Open menu'}
					aria-expanded={open}
					onclick={() => (open = !open)}
				>
					<Icon name={open ? 'close' : 'menu'} class={cn('h-6 w-6 transition-colors duration-300', inkClass)} />
				</button>
			</div>
		</div>
	</Container>
</header>

{#if open}
	<div class="fixed inset-0 z-40 flex flex-col justify-center bg-surface px-container md:hidden">
		<nav class="flex flex-col gap-6">
			{#each navContent.items as item (item.href)}
				<a href={item.href} onclick={close}>
					<Heading level={3} size="xl">{item.label}</Heading>
				</a>
			{/each}
		</nav>
	</div>
{/if}
