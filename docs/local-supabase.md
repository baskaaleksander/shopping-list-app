# Local Supabase

This project supports only a self-hosted local Supabase stack. Hosted Supabase cloud projects are out of scope.

## Prerequisites

- Docker Desktop or OrbStack must be running.
- Node.js and npm must be available so `npx supabase` can run.

## Start the local stack

```sh
npx supabase start
```

This command starts the local Supabase services with Docker Compose-managed containers.

## Stop the local stack

```sh
npx supabase stop
```

## Reset the local database

```sh
npx supabase db reset
```

Use reset after adding or changing migrations when you want a clean local database.

## Inspect local services and credentials

```sh
npx supabase status
npx supabase status -o env
```

Use the `API_URL` value for `EXPO_PUBLIC_SUPABASE_URL`.
Use the `ANON_KEY` value for `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Do not put `SERVICE_ROLE_KEY`, `SECRET_KEY`, or any other non-public credential into the mobile app.

## Local URLs

- API: `http://127.0.0.1:54321`
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`
- Mailpit: `http://127.0.0.1:54324`

## Client configuration

The mobile app should only use public client credentials from `.env.example`.
If the local stack is recreated and the anon key changes, refresh `.env.example` from `npx supabase status -o env`.
