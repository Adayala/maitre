# Maitre Waiter (mozo) app — `@maitre/waiter-app`

A mobile-first frontend for **waiters working the floor**, used on a personal
phone while walking around the restaurant. It is the second role-specific staff
app after `apps/kitchen` (the KDS), and consumes the already-built Maitre API —
it contains no backend logic of its own.

## What it does

- **Floor map** (home): a touch grid of tables, color-coded by live status
  (green = libre / blue = ocupada / amber = pagando). Tap a free table to seat a
  party; tap an occupied/paying table to open its visit.
- **Seat a visit**: a bottom sheet with a guest-count stepper and optional
  combining of extra free tables → `POST /v1/visits`.
- **Visit detail**: the visit's orders (grouped by status) and the check
  total/balance, with thumb-reachable bottom actions — **Nuevo pedido**, **Pedir
  la cuenta** (`request-payment`), and **Cerrar mesa** (`request-close` +
  `close`, gated on a settled check). READY items can be marked **Entregar**
  (`order:deliver`).
- **Order-taking**: browse menu categories (chip strip) → products, add to a
  running DRAFT order with a quantity stepper and optional per-item note, review
  the cart in a sheet (edit quantities / remove), then **Enviar a cocina**
  (`submit`), which dispatches the items to the kitchen (KDS) and appends the
  total to the check.

## Design

Dark-first (respects `prefers-color-scheme`), tuned for a 390×844 phone: bold
color-coded status, 48px+ tap targets, and primary actions anchored to a bottom
dock so they are reachable one-handed. Visual language mirrors `apps/kitchen`,
re-flowed for a narrow viewport.

## Running

```bash
npm install                 # from the repo root (workspaces glob picks this up)
npm run dev --workspace apps/waiter
```

Dev server runs on **http://localhost:5176** (web=5173, kitchen=5175).

Point it at the API and choose an auth mode via `.env` (see `.env.example`):

```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=            # empty → fixture-token login (paste e.g. "demo-token")
VITE_SUPABASE_PUBLISHABLE_KEY=
```

With the API booted as `PERSISTENCE_DRIVER=memory AUTH_DRIVER=fixture`, log in
with the demo fixture token `demo-token`.

## Auth & context

Reuses the dual-mode auth pattern from `apps/web` / `apps/kitchen`: a real
Supabase session when configured, otherwise a pasted fixture bearer token. After
login, a sticky tenant + branch selection (`/v1/me/context`) scopes the app;
both auto-resolve when there is only one option.

## Permissions & known gaps

The app targets the `role_waiter` grant set. Some floor conveniences read data
that role does **not** have by default:

- **Full table grid** needs `salon:read` + `table:read`; a plain waiter token
  lacks them, so the app falls back to the **table-status projection**, which
  only lists tables that currently have visit activity. With an
  admin/manager/owner token (e.g. the `demo-token`) the complete salon grid
  renders.
- **Menu browsing** resolves the brand via `GET /v1/branches/:id` (`branch:read`).
  A waiter token without it surfaces a clear error on the order screen. Resolving
  the brand from `/v1/me/context` instead would remove this dependency — a
  suggested backend follow-up.

## Deferred (not built)

- **No modifier UI** — the Catalog `Product` domain has no modifier/option
  schema, so only per-item notes are supported.
- **No payment collection** — waiters can *request* payment
  (`check:request-payment`); actually settling/capturing is the Cashier app's job
  (`check:settle`, `payment:*` are not granted here).
- **Polling only** — live-ness is short-interval React Query refetch, not push /
  realtime.
- **No offline support.**
