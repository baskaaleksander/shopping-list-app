#!/usr/bin/env bash

# Verifies that:
# - authenticated users can create and read their own profiles, lists, and items
# - authenticated users cannot read or write another user's rows
# - unauthenticated requests cannot read protected shopping list data

set -euo pipefail

fail() {
  printf 'RLS validation failed: %s\n' "$1" >&2
  exit 1
}

request() {
  local output_file=$1
  shift
  curl -sS -o "$output_file" -w '%{http_code}' "$@"
}

while IFS= read -r line; do
  case "$line" in
    API_URL=*|ANON_KEY=*)
      eval "export $line"
      ;;
  esac
done < <(npx supabase@latest status -o env)

[[ -n "${API_URL:-}" && -n "${ANON_KEY:-}" ]] || fail 'could not load local Supabase API_URL and ANON_KEY'

PASSWORD='Password123!'
STAMP=$(date +%s)
OWNER_EMAIL="owner-${STAMP}@example.com"
GUEST_EMAIL="guest-${STAMP}@example.com"
OWNER_USERNAME="owner-${STAMP}"
GUEST_USERNAME="guest-${STAMP}"

OWNER_SIGNUP=$(mktemp)
GUEST_SIGNUP=$(mktemp)
OWNER_PROFILE=$(mktemp)
GUEST_PROFILE=$(mktemp)
OWNER_LIST=$(mktemp)
OWNER_ITEM=$(mktemp)
OWNER_LISTS=$(mktemp)
OWNER_ITEMS=$(mktemp)
GUEST_LISTS=$(mktemp)
GUEST_ITEMS=$(mktemp)
GUEST_INSERT=$(mktemp)
ANON_LISTS=$(mktemp)

trap 'rm -f "$OWNER_SIGNUP" "$GUEST_SIGNUP" "$OWNER_PROFILE" "$GUEST_PROFILE" "$OWNER_LIST" "$OWNER_ITEM" "$OWNER_LISTS" "$OWNER_ITEMS" "$GUEST_LISTS" "$GUEST_ITEMS" "$GUEST_INSERT" "$ANON_LISTS"' EXIT

request "$OWNER_SIGNUP" \
  -X POST "$API_URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null

request "$GUEST_SIGNUP" \
  -X POST "$API_URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$GUEST_EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null

OWNER_ID=$(jq -r '.user.id // empty' "$OWNER_SIGNUP")
OWNER_TOKEN=$(jq -r '.access_token // empty' "$OWNER_SIGNUP")
GUEST_ID=$(jq -r '.user.id // empty' "$GUEST_SIGNUP")
GUEST_TOKEN=$(jq -r '.access_token // empty' "$GUEST_SIGNUP")

[[ -n "$OWNER_ID" && -n "$OWNER_TOKEN" ]] || fail 'owner signup did not return a session'
[[ -n "$GUEST_ID" && -n "$GUEST_TOKEN" ]] || fail 'guest signup did not return a session'

PROFILE_STATUS=$(request "$OWNER_PROFILE" \
  -X POST "$API_URL/rest/v1/profiles" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{\"id\":\"$OWNER_ID\",\"username\":\"$OWNER_USERNAME\"}")
[[ "$PROFILE_STATUS" == '201' ]] || fail 'owner profile insert was not allowed'

PROFILE_STATUS=$(request "$GUEST_PROFILE" \
  -X POST "$API_URL/rest/v1/profiles" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{\"id\":\"$GUEST_ID\",\"username\":\"$GUEST_USERNAME\"}")
[[ "$PROFILE_STATUS" == '201' ]] || fail 'guest profile insert was not allowed'

LIST_STATUS=$(request "$OWNER_LIST" \
  -X POST "$API_URL/rest/v1/shopping_lists" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{\"user_id\":\"$OWNER_ID\",\"name\":\"Weekly groceries\"}")
[[ "$LIST_STATUS" == '201' ]] || fail 'owner shopping list insert was not allowed'

OWNER_LIST_ID=$(jq -r '.[0].id // empty' "$OWNER_LIST")
[[ -n "$OWNER_LIST_ID" ]] || fail 'owner shopping list ID was not returned'

ITEM_STATUS=$(request "$OWNER_ITEM" \
  -X POST "$API_URL/rest/v1/items" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{\"user_id\":\"$OWNER_ID\",\"list_id\":\"$OWNER_LIST_ID\",\"name\":\"Milk\",\"quantity\":2}")
[[ "$ITEM_STATUS" == '201' ]] || fail 'owner item insert was not allowed'

ANON_LIST_STATUS=$(request "$ANON_LISTS" \
  "$API_URL/rest/v1/shopping_lists?select=id,name,user_id" \
  -H "apikey: $ANON_KEY")

OWNER_LIST_STATUS=$(request "$OWNER_LISTS" \
  "$API_URL/rest/v1/shopping_lists?select=id,name,user_id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $OWNER_TOKEN")
OWNER_ITEM_STATUS=$(request "$OWNER_ITEMS" \
  "$API_URL/rest/v1/items?select=id,name,user_id,list_id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $OWNER_TOKEN")
GUEST_LIST_STATUS=$(request "$GUEST_LISTS" \
  "$API_URL/rest/v1/shopping_lists?select=id,name,user_id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $GUEST_TOKEN")
GUEST_ITEM_STATUS=$(request "$GUEST_ITEMS" \
  "$API_URL/rest/v1/items?select=id,name,user_id,list_id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $GUEST_TOKEN")

[[ "$OWNER_LIST_STATUS" == '200' ]] || fail 'owner list select did not succeed'
[[ "$OWNER_ITEM_STATUS" == '200' ]] || fail 'owner item select did not succeed'
[[ "$(jq 'length' "$OWNER_LISTS")" == '1' ]] || fail 'owner could not read the expected shopping list'
[[ "$(jq 'length' "$OWNER_ITEMS")" == '1' ]] || fail 'owner could not read the expected item'

[[ "$GUEST_LIST_STATUS" == '200' ]] || fail 'guest list select did not complete'
[[ "$GUEST_ITEM_STATUS" == '200' ]] || fail 'guest item select did not complete'
[[ "$(jq 'length' "$GUEST_LISTS")" == '0' ]] || fail 'guest could see another user shopping list'
[[ "$(jq 'length' "$GUEST_ITEMS")" == '0' ]] || fail 'guest could see another user item'

GUEST_INSERT_STATUS=$(request "$GUEST_INSERT" \
  -X POST "$API_URL/rest/v1/shopping_lists" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"user_id\":\"$OWNER_ID\",\"name\":\"Stolen list\"}")
[[ "$GUEST_INSERT_STATUS" == '401' || "$GUEST_INSERT_STATUS" == '403' ]] || fail 'guest cross-user insert was not denied'

[[ "$ANON_LIST_STATUS" == '401' || "$ANON_LIST_STATUS" == '403' ]] || fail 'anonymous shopping list access was not denied'

printf 'RLS validation succeeded.\n'
