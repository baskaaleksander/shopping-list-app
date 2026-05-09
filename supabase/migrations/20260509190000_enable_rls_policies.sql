alter table public.profiles enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.items enable row level security;

revoke all on public.profiles from anon;
revoke all on public.shopping_lists from anon;
revoke all on public.items from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.shopping_lists to authenticated;
grant select, insert, update, delete on public.items to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

create policy "shopping_lists_select_own"
on public.shopping_lists
for select
to authenticated
using (auth.uid() = user_id);

create policy "shopping_lists_insert_own"
on public.shopping_lists
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "shopping_lists_update_own"
on public.shopping_lists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "shopping_lists_delete_own"
on public.shopping_lists
for delete
to authenticated
using (auth.uid() = user_id);

create policy "items_select_own"
on public.items
for select
to authenticated
using (auth.uid() = user_id);

create policy "items_insert_own"
on public.items
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "items_update_own"
on public.items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "items_delete_own"
on public.items
for delete
to authenticated
using (auth.uid() = user_id);
