-- Floor domain (SPEC-049..054): Visit, Occupancy, Check, Payment,
-- ServicePeriod. Simplified "CRUD simple + invariantes clave" scope — see
-- packages/modules/floor/src/domain/*.ts for the documented deferred gaps
-- (ordered multi-table locking, versioned Capacity/ServicePeriodPolicy,
-- full refund ledger, provider webhook dedup/PENDING_RECONCILIATION,
-- DST-aware business date, split checks, CashMovement wiring).

create table floor_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  table_ids uuid[] not null default '{}',
  guest_count integer not null check (guest_count >= 0),
  reservation_id uuid,
  status text not null check (status in ('OPEN', 'CLOSING', 'CLOSED', 'CANCELLED')),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text
);

create table floor_occupancies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  table_id uuid not null references organization_tables (id),
  visit_id uuid not null references floor_visits (id),
  guest_count integer not null check (guest_count >= 0),
  status text not null check (status in ('ACTIVE', 'CLOSED')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  revision integer not null default 1
);

-- SPEC-050 hard invariant: no two ACTIVE occupancies for the same Table.
create unique index floor_occupancies_one_active_per_table
  on floor_occupancies (table_id)
  where status = 'ACTIVE';

create table floor_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  visit_id uuid not null references floor_visits (id),
  currency char(3) not null,
  lines jsonb not null default '[]',
  adjustments jsonb not null default '[]',
  status text not null check (status in ('OPEN', 'PAYMENT_PENDING', 'SETTLED', 'VOID')),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SPEC-052: one Check per Visit (MVP scope — no split checks).
create unique index floor_checks_one_per_visit on floor_checks (visit_id);

create table floor_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  check_id uuid not null references floor_checks (id),
  amount_minor_units bigint not null check (amount_minor_units >= 0),
  currency char(3) not null,
  tip_minor_units bigint,
  method text not null check (method in ('CASH', 'CARD', 'OTHER')),
  status text not null check (status in ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'VOID')),
  refund_amount_minor_units bigint,
  refund_status text check (refund_status in ('PENDING', 'SUCCEEDED', 'FAILED')),
  idempotency_key text not null,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create table floor_service_periods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  business_date date not null,
  name text not null,
  type text not null check (type in ('BREAKFAST', 'LUNCH', 'DINNER', 'OTHER')),
  planned_open timestamptz,
  planned_close timestamptz,
  actual_open timestamptz,
  actual_close timestamptz,
  status text not null check (status in ('PLANNED', 'OPEN', 'CLOSING', 'CLOSED', 'CANCELLED')),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SPEC-054 hard rule: at most one OPEN/CLOSING ServicePeriod per Branch.
create unique index floor_service_periods_one_active_per_branch
  on floor_service_periods (branch_id)
  where status in ('OPEN', 'CLOSING');

alter table floor_visits enable row level security;
alter table floor_occupancies enable row level security;
alter table floor_checks enable row level security;
alter table floor_payments enable row level security;
alter table floor_service_periods enable row level security;

create policy tenant_isolation on floor_visits
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on floor_occupancies
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on floor_checks
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on floor_payments
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on floor_service_periods
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  floor_visits, floor_occupancies, floor_checks, floor_payments, floor_service_periods
to service_role;
