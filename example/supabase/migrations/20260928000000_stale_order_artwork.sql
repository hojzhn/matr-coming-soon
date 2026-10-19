create index if not exists print_order_items_artwork_path_idx on public.print_order_items (artwork_path);

create or replace function public.stale_order_artwork_paths(max_age interval default interval '7 days')
returns table (path text)
language sql
security definer
set search_path = ''
as $$
	select o.name
	from storage.objects o
	where o.bucket_id = 'order-artwork'
		and o.created_at < now() - max_age
		and not exists (
			select 1 from public.print_order_items i where i.artwork_path = o.name
		)
	limit 5000;
$$;

revoke execute on function public.stale_order_artwork_paths(interval) from public, anon, authenticated;
