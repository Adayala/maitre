# Maitre Host / Maître app — `@maitre/host-app`

A touch-first frontend for the **host / maître / reception** role. It focuses
on arrivals, seating, availability and waitlist orchestration, consuming the
shared Maitre API with no backend logic of its own.

## What it does

- **Arrivals board**: upcoming reservations and a quick operational snapshot of
  the next service window.
- **Reservation intake & triage**: create reservations, confirm them, mark
  no-show, and seat parties into available tables.
- **Waitlist management**: register walk-ins, notify them, reprioritize the
  queue, and seat them when capacity appears.
- **Availability check**: a live check against current reservations and floor
  occupancy to answer “do we have room?” from reception.
- **Table snapshot**: a fast salon overview to support seating decisions.

## Design

Dark-first and touch-first, optimized for reception/front-desk use on tablet or
phone. The layout emphasizes quick triage, clear status chips, thumb-reachable
actions and high-contrast state changes during busy service.

## Running

```bash
npm install                 # from the repo root (workspaces glob picks this up)
npm run dev --workspace apps/host
```

Dev server runs on **http://localhost:5178** by default.

Point it at the API and choose an auth mode via `.env` (see `.env.example`):

```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=            # set for real auth; empty only for local fixture fallback
VITE_SUPABASE_PUBLISHABLE_KEY=
```

If the API detects `SUPABASE_URL` + (`SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`), it now uses
Supabase persistence by default and `AUTH_DRIVER=supabase` unless you override
it. For the local fallback backend, boot the API with
`PERSISTENCE_DRIVER=memory AUTH_DRIVER=fixture`.

## Auth & context

Uses Supabase Auth as the normal path. The pasted bearer token flow exists only
as a local fallback when the build has no Supabase configuration. After login,
a sticky tenant + branch selection (`/v1/me/context`) scopes the app; both
auto-resolve when there is only one option.

## Permissions & known gaps

The app targets a reception/host workflow. In practice it needs permissions
across reservations, waitlist, availability and table visibility; the smoothest
local testing path today is an admin/manager/owner token until the host-specific
grant set is fully formalized.

## Deferred (not built)

- **No dedicated receptionist RBAC profile** fully closed end-to-end yet.
- **No push/realtime** — the app currently relies on polling / refetch.
- **No offline support.**
