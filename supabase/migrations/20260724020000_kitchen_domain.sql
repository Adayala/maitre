-- Kitchen domain (SPEC-098..110): Station, Command (the real replacement for the
-- Ordering placeholder KitchenTicket), KitchenAlert. Simplified "CRUD simple +
-- invariantes clave" scope — see packages/modules/kitchen/src/domain/*.ts for the
-- documented deferred gaps:
--   - Station is a plain config entity (code unique per branch, capabilities,
--     status, display order); no versioned/published RoutingPolicy. Routing is
--     simplified to explicit stationId or the branch's first ACTIVE Station.
--   - Command implements the full SPEC-110 state machine (RECEIVED -> CLAIMED ->
--     IN_PROGRESS -> ON_HOLD -> READY -> COMPLETED, CANCELLED, release, exceptional
--     READY -> IN_PROGRESS rollback). One Command per OrderItem (no allocations).
--     payload is simple typed fields (no discriminated commandType+schemaVersion
--     union); transfer appends to a transfer_history JSONB array; reprioritize is a
--     direct priority write. No technical-attempt/retry ledger.
--   - KitchenAlert is the simple version: two hardcoded threshold rules evaluated
--     on-demand (no scheduler), dedup only by (command_id + rule_code) while not
--     RESOLVED (no evidence-window fingerprint, no versioned rule/clock policy).
--
-- KitchenTicket retirement: the Ordering placeholder table is dropped here. Nothing
-- else references ordering_kitchen_tickets (its only FK was TO ordering_orders), so
-- the drop is safe.

drop table if exists ordering_kitchen_tickets;

create table kitchen_stations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid not null references organization_brands (id),
  branch_id uuid not null references organization_branches (id),
  code text not null,
  display_name text not null,
  capabilities jsonb not null default '[]'::jsonb,
  status text not null check (status in ('ACTIVE', 'INACTIVE')),
  display_order integer not null default 0,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, branch_id, code)
);

create table kitchen_commands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid not null references organization_brands (id),
  branch_id uuid not null references organization_branches (id),
  visit_id uuid not null,
  order_id uuid not null,
  order_item_id uuid not null,
  station_id uuid not null references kitchen_stations (id),
  status text not null check (
    status in ('RECEIVED', 'CLAIMED', 'IN_PROGRESS', 'ON_HOLD', 'READY', 'COMPLETED', 'CANCELLED')
  ),
  priority integer not null default 0,
  owner_actor_ref text,
  payload jsonb not null default '{}'::jsonb,
  cancel_reason text,
  transfer_history jsonb not null default '[]'::jsonb,
  revision integer not null default 1,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  claimed_at timestamptz,
  started_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz
);

create index kitchen_commands_station_idx on kitchen_commands (tenant_id, station_id);
create index kitchen_commands_order_idx on kitchen_commands (tenant_id, order_id);
create index kitchen_commands_branch_idx on kitchen_commands (tenant_id, branch_id);

create table kitchen_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid,
  branch_id uuid not null references organization_branches (id),
  station_id uuid,
  command_id uuid not null,
  rule_code text not null,
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH')),
  status text not null check (status in ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED')),
  escalation_level integer,
  resolution_reason text,
  opened_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kitchen_alerts_branch_idx on kitchen_alerts (tenant_id, branch_id);
-- The one real dedup invariant: at most one non-RESOLVED alert per (command, rule).
create unique index kitchen_alerts_open_dedup_idx
  on kitchen_alerts (tenant_id, command_id, rule_code)
  where status <> 'RESOLVED';

alter table kitchen_stations enable row level security;
alter table kitchen_commands enable row level security;
alter table kitchen_alerts enable row level security;

create policy tenant_isolation on kitchen_stations
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on kitchen_commands
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on kitchen_alerts
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  kitchen_stations, kitchen_commands, kitchen_alerts
to service_role;
