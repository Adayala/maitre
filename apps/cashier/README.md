# Maitre — Cashier (caja) app — `@maitre/cashier-app`

A frontend for **cashiers running a cash register**, used at a fixed point of
sale (desktop or counter tablet) to open and close cash sessions, record
movements, and reconcile the drawer. It is one of several role-specific staff
apps (kitchen, waiter, cashier, host, customer) and consumes the already-built
Maitre Cash / Settlement API — it contains no backend logic of its own.

## What it does

- **Login** — dual-mode (same as `apps/web` / `apps/kitchen`): Supabase password
  sign-in when configured, otherwise a pasted fixture access token. A counter
  device signs in once and stays signed in for the shift.
- **Device setup** — a sticky cascade to pick tenant → branch → **cash register**
  (each auto-resolves when there's only one option), so the device is dedicated
  to one register.
- **Cash session** — the core screen bound to the selected register
  (`GET /v1/cash-registers/:id`, `…/sessions`):
  - **Apertura** — open a session with a declared opening float
    (`POST /v1/cash-registers/:id/sessions`).
  - **Movements** — record drawer movements against the open session
    (`POST /v1/cash-sessions/:id/movements`) with quick-action buttons and
    preset amounts: cash sale, refund, deposit, withdrawal, tip in/out, and
    signed adjustments. A live "movimientos recientes" list (filterable by
    IN/OUT) and a per-type breakdown keep a running picture of the drawer.
  - **Cierre** — a two-step close: **begin-close**
    (`POST /v1/cash-sessions/:id/begin-close`) then **close** with the counted
    total (`POST /v1/cash-sessions/:id/close`), which produces a reconciliation.
- **Reconciliation** — for a closed/reconciled session, pull the reconciliation
  record and its expected summary (`/v1/cash-reconciliations/:id`, `…/summary`),
  enter the physical **counted amounts** (`…/record-counts`) to compute the
  variance against expected, then **submit** (`…/submit`) to finalize.
- **Daily settlement** — a branch-level end-of-day roll-up for a chosen business
  date (`GET /v1/branches/:id/daily-settlement?businessDate=…&currency=…`).
- **Session history** — the day's sessions with a status filter (OPEN / CLOSING
  / CLOSED / RECONCILED) for at-a-glance auditing.

## Design

Follows the same visual language as the other role apps, respecting
`prefers-color-scheme`. Tuned for a counter workstation: quick-movement buttons,
preset amounts, and large numeric readouts so the current drawer balance and
variance are legible at a glance. Currency defaults to `ARS`
(`America/Argentina/Buenos_Aires`).

## Run

```bash
# from the repo root — install the workspace (apps/* is auto-globbed)
npm install

# start the API; with Supabase env vars present it auto-selects the real
# Supabase-backed runtime, otherwise it falls back to memory + fixture auth
npm run dev --workspace apps/api

# explicit local fallback backend, if you want in-memory + fixture auth
PERSISTENCE_DRIVER=memory AUTH_DRIVER=fixture npm run dev --workspace apps/api

# start this app (dev server on :5174)
npm run dev --workspace apps/cashier
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to the API origin. Set the
Supabase vars for real auth; leave them empty only for the local fallback
backend.

Build / type-check: `npm run build --workspace apps/cashier`.

## Auth & context

Uses Supabase Auth as the normal path. The pasted bearer token flow exists only
as a local fallback when the build has no Supabase configuration. After login,
a sticky tenant + branch + register selection scopes the app; each level
auto-resolves when there is only one option.

## Deferred / future enhancements

- **Polling only** — live-ness is short-interval React Query refetch (register
  15s, sessions/movements 5s), not push / realtime.
- **No offline support** — every action refetches from the API.
- **No card / non-cash capture** — this app tracks the physical cash drawer; card
  and other tender settlement live elsewhere in the settlement pipeline.
