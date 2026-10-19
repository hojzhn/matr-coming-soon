create table if not exists order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references print_orders(id) on delete cascade,
	project_name text,
	width_in numeric not null,
	height_in numeric not null,
	sq_in numeric not null,
	base_price_cents integer not null,
	options jsonb not null default '[]'::jsonb,
	margin_in numeric,
	quantity integer not null default 1,
	unit_price_cents integer not null,
	total_price_cents integer not null,
	artwork_path text,
	artwork_file_name text,
	created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);

alter table order_items enable row level security;

alter table print_orders drop column if exists items;
