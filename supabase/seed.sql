-- Local demo credentials:
-- email: seed@example.com
-- password: Password123!

do $$
declare
  seed_user_id constant uuid := '11111111-1111-4111-8111-111111111111';
  seed_email constant text := 'seed@example.com';
  seed_password constant text := 'Password123!';
  seed_username constant text := 'seed-user';
  seeded_at constant timestamptz := timezone('utc', now());
begin
  delete from public.items where user_id = seed_user_id;
  delete from public.shopping_lists where user_id = seed_user_id;
  delete from public.profiles where id = seed_user_id;
  delete from auth.identities where user_id = seed_user_id;
  delete from auth.users where id = seed_user_id;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    reauthentication_token,
    email_change,
    phone_change,
    phone_change_token,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    seed_user_id,
    'authenticated',
    'authenticated',
    seed_email,
    crypt(seed_password, gen_salt('bf')),
    seeded_at,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    seeded_at,
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'sub', seed_user_id::text,
      'email', seed_email,
      'email_verified', true,
      'phone_verified', false
    ),
    seeded_at,
    seeded_at,
    false,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    seed_user_id,
    jsonb_build_object(
      'sub', seed_user_id::text,
      'email', seed_email,
      'email_verified', false,
      'phone_verified', false
    ),
    'email',
    seed_user_id::text,
    seeded_at,
    seeded_at,
    seeded_at
  );

  insert into public.profiles (id, username)
  values (seed_user_id, seed_username);

  insert into public.shopping_lists (
    id,
    user_id,
    name,
    completed,
    created_at,
    updated_at
  )
  select
    ('00000000-0000-4000-8000-' || lpad(list_number::text, 12, '0'))::uuid,
    seed_user_id,
    format('Seed Shopping List %s', lpad(list_number::text, 3, '0')),
    list_number % 5 = 0,
    seeded_at - make_interval(days => 100 - list_number),
    seeded_at - make_interval(days => 100 - list_number)
  from generate_series(1, 100) as list_number;

  insert into public.items (
    user_id,
    list_id,
    name,
    quantity,
    completed,
    created_at,
    updated_at
  )
  select
    seed_user_id,
    ('00000000-0000-4000-8000-' || lpad(list_number::text, 12, '0'))::uuid,
    format(
      'Item %s for list %s',
      lpad(item_number::text, 2, '0'),
      lpad(list_number::text, 3, '0')
    ),
    ((item_number - 1) % 4) + 1,
    item_number <= ((list_number - 1) % 10),
    seeded_at - make_interval(days => 100 - list_number, mins => item_number),
    seeded_at - make_interval(days => 100 - list_number, mins => item_number)
  from generate_series(1, 100) as list_number
  cross join generate_series(1, 20) as item_number;
end
$$;
