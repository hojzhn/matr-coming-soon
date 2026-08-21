alter table print_orders
	add column if not exists discount_code text,
	add column if not exists discount_cents integer not null default 0;
