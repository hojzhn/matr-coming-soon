alter table print_orders
	drop column if exists project_name,
	drop column if exists raw_width,
	drop column if exists raw_height,
	drop column if exists raw_unit,
	drop column if exists width_in,
	drop column if exists height_in,
	drop column if exists sq_in,
	drop column if exists finish,
	drop column if exists quantity,
	drop column if exists price_cents;
