create extension if not exists pgcrypto;

create table if not exists newsletter_subscribers (
	id uuid primary key default gen_random_uuid(),
	email text not null unique,
	created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create table if not exists print_orders (
	id uuid primary key default gen_random_uuid(),
	project_name text,
	raw_width numeric not null,
	raw_height numeric not null,
	raw_unit text not null,
	width_in numeric not null,
	height_in numeric not null,
	sq_in numeric not null,
	finish text not null default 'matte',
	quantity integer not null default 1,
	price_cents integer not null,
	total_price_cents integer not null,
	status text not null default 'pending',
	shopify_draft_order_id text,
	shopify_invoice_url text,
	created_at timestamptz not null default now()
);

alter table print_orders enable row level security;
