# Maitre — Kitchen Display System (KDS)

`@maitre/kitchen-app` — a touch-first frontend for **cooks** working a kitchen
station, meant for a large tablet or monitor mounted in the kitchen. It consumes
the already-complete Kitchen API (SPEC-098…110) and is the first of several
role-specific staff apps (kitchen, waiter, cashier, guest).

This is a pure frontend consumer. It adds no backend routes and reuses the same
auth / tenant-context / api-client architecture as `apps/web`.

## What it does

- **Login** — dual-mode (same as `apps/web`): Supabase password sign-in when
  configured, otherwise a pasted fixture access token. A kitchen tablet signs in
  once and stays signed in for the shift.
- **Device setup** — a sticky cascade to pick tenant → branch → **station**
  (each auto-resolves when there's only one option). The station choice is
  persisted in `localStorage` (`maitre.kitchen.selectedStationId`) so the device
  is dedicated to one station across reloads. Re-open it from the header gear.
- **Production queue** — the core screen. Polls
  `GET /v1/kitchen/stations/:id/production-queue` every **4s** and renders each
  Command as a large, touch-friendly **card** (not a table row) with quantity,
  name, modifiers, notes, **loud allergen badges** (safety-critical), a live
  elapsed timer that escalates calm → amber → red, and the current status. Cards
  keep the API's priority/`receivedAt` ordering (no client re-sort).
- **Card actions** follow the SPEC-110 state machine, cook-tier only:
  RECEIVED → **Tomar** (claim); CLAIMED → **Empezar** / **Soltar**;
  IN_PROGRESS → **Marcar lista** / **Pausar**; ON_HOLD → **Reanudar**;
  READY → **Entregar** (complete-handoff). **Cancelar** (with a required reason
  prompt) is available from non-terminal states, styled as a low-emphasis
  destructive action. Terminal commands drop off the queue; the last few appear
  in a "Recién salió" throughput strip.
- **Alerts** — a header banner showing the count of OPEN branch alerts, polled
  every 30s. Tap to acknowledge / resolve (escalate is manager-tier and omitted).

Manager-tier moves (transfer, reprioritize, rollback, station management,
alert escalate) are intentionally **not** exposed here. The cook role also lacks
`command_cancel` / `alert_acknowledge` in the default `role_cook`; those buttons
degrade gracefully (a clear "no tenés permiso" message) if the backend returns
403.

## Design

Dark-first for low glare and tablet battery, with a light override that respects
`prefers-color-scheme`. Big type, 64px+ action buttons, color-coded status
(blue RECEIVED, amber CLAIMED, cyan IN_PROGRESS, gray ON_HOLD, green READY) and a
**time-based urgency overlay** (border/glow) kept visually independent of the
status color so the two signals don't collide.

## Run

```bash
# from the repo root — install the workspace (apps/* is auto-globbed)
npm install

# start the API with the fast in-memory + fixture-token backend
PERSISTENCE_DRIVER=memory AUTH_DRIVER=fixture npm run dev --workspace apps/api

# start this app (dev server on :5175)
npm run dev --workspace apps/kitchen
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to the API origin. Leave the
Supabase vars empty to use the fixture-token login (the demo backend token is
`demo-token`).

Build / type-check: `npm run build --workspace apps/kitchen`.

## Deferred / future enhancements

- **Real-time push** — updates are poll-based (queue 4s, alerts 30s). No
  WebSocket/SSE infra exists in the backend yet; that's the intended upgrade.
- **No offline support / optimistic caching** — an action refetches the queue.
- **Multi-cook attribution** — a shared device shows `ownerActorRef` (yours vs.
  another cook, dimmed) but has no per-user device login.
