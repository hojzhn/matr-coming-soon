alter table print_orders
	add column if not exists items jsonb not null default '[]'::jsonb;

alter table print_orders
	alter column raw_width drop not null,
	alter column raw_height drop not null,
	alter column raw_unit drop not null,
	alter column width_in drop not null,
	alter column height_in drop not null,
	alter column sq_in drop not null,
	alter column finish drop not null,
	alter column quantity drop not null,
	alter column price_cents drop not null;
