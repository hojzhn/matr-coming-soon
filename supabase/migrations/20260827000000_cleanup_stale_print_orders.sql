do $$
begin
	if exists (select 1 from cron.job where jobname = 'cleanup-stale-print-orders') then
		perform cron.unschedule('cleanup-stale-print-orders');
	end if;
end $$;

select cron.schedule(
	'cleanup-stale-print-orders',
	'0 3 * * *',
	$$
		delete from print_orders
		where status in ('pending', 'draft_created', 'failed')
			and created_at < now() - interval '7 days'
	$$
);
