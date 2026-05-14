alter table public.shopping_lists
add column if not exists completed boolean not null default false;
