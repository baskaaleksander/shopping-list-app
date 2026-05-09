create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_not_blank check (char_length(btrim(username)) > 0)
);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint shopping_lists_name_not_blank check (char_length(btrim(name)) > 0),
  constraint shopping_lists_id_user_id_unique unique (id, user_id)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  list_id uuid not null,
  name text not null,
  quantity integer not null default 1,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint items_name_not_blank check (char_length(btrim(name)) > 0),
  constraint items_quantity_positive check (quantity > 0),
  constraint items_list_owner_fkey foreign key (list_id, user_id) references public.shopping_lists (id, user_id) on delete cascade
);

create index if not exists shopping_lists_user_id_idx on public.shopping_lists (user_id);
create index if not exists items_user_id_idx on public.items (user_id);
create index if not exists items_list_id_idx on public.items (list_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_shopping_lists_updated_at
before update on public.shopping_lists
for each row
execute function public.set_updated_at();

create trigger set_items_updated_at
before update on public.items
for each row
execute function public.set_updated_at();
