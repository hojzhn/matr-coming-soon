create table if not exists contact_messages (
	id uuid primary key default gen_random_uuid(),
	shop_id uuid references shops(id) on delete set null,
	name text not null,
	email text not null,
	message text not null,
	source text not null default 'coming-soon-site',
	status text not null default 'new',
	email_notified_at timestamptz,
	created_at timestamptz not null default now()
);

create index if not exists contact_messages_shop_id_created_at_idx on contact_messages (shop_id, created_at desc);
create index if not exists contact_messages_email_idx on contact_messages (email);

alter table contact_messages enable row level security;
