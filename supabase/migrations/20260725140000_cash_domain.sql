-- Cash domain (SPEC-124..136): CashRegister, CashSession, CashMovement,
-- CashReconciliation, Discount, DiscountApplication. Simplified "CRUD simple +
-- invariantes clave" scope — see packages/modules/cash/src/domain/*.ts for the
-- documented deferred gaps:
--   - CashSession enforces one OPEN/CLOSING per (register, currency); CLOSED
--     freezes the ledger. LateAdjustment / adjustment-session mechanics are
--     deferred — a late payment lands in the NEXT session's ledger.
--   - CashMovement is an immutable journal (no update/delete); corrections are
--     new compensating entries (compensates_movement_id). CLOSING_COUNT is
--     informational (0 ledger contribution). sourceReference dedup is a simple
--     per-register uniqueness check; no LimitsPolicy engine.
--   - CashReconciliation.expected is always server-computed from the frozen
--     ledger; a rejected reconciliation re-drives via an attempt counter
--     (no full revision-chain versioning). Segregation-of-duties is not
--     hard-enforced (route permission is the only gate).
--   - Discount is FIXED (minor units) or PERCENTAGE (basis points); publish
--     freezes it. No stacking/caps/priority/approval-threshold engine.
--   - DiscountApplication is an audit-trail record only; it does NOT mutate a
--     Floor Check total (deferred Floor/Cash integration).
--   - SPEC-134 DailySettlement is a stateless calculation (no stored table).
--   - SPEC-136 (fraud/compliance rule engine) is a placeholder — no entity.
--   - Floor Payment capture <-> Cash Movement recording is NOT auto-linked; a
--     cashier records the CASH_SALE by hand with the Payment id as sourceReference.

create table cash_registers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  code text not null,
  display_name text not null,
  allowed_currencies jsonb not null default '[]'::jsonb,
  status text not null check (status in ('ACTIVE', 'SUSPENDED', 'RETIRED')),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, branch_id, code)
);

create table cash_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  cash_register_id uuid not null references cash_registers (id),
  currency text not null,
  business_date text not null,
  timezone text not null,
  opening_amount_minor_units bigint not null default 0,
  opened_at timestamptz not null default now(),
  opened_by text not null,
  cutoff_at timestamptz,
  closed_at timestamptz,
  closed_by text,
  ledger_revision integer not null default 0,
  status text not null check (status in ('OPEN', 'CLOSING', 'CLOSED', 'RECONCILED')),
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cash_sessions_register_currency_idx on cash_sessions (cash_register_id, currency);
create index cash_sessions_branch_date_idx on cash_sessions (branch_id, business_date, currency);
-- Enforce the one-OPEN/CLOSING-per-(register,currency) invariant at the DB level
-- too (the use case checks it first; this is a defensive partial unique index).
create unique index cash_sessions_one_live_per_register_currency
  on cash_sessions (cash_register_id, currency)
  where status in ('OPEN', 'CLOSING');

create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  cash_register_id uuid not null references cash_registers (id),
  cash_session_id uuid not null references cash_sessions (id),
  currency text not null,
  type text not null check (
    type in ('OPENING', 'CASH_SALE', 'CASH_REFUND', 'DEPOSIT', 'WITHDRAWAL', 'TIP_IN', 'TIP_OUT', 'ADJUSTMENT', 'CLOSING_COUNT')
  ),
  direction text not null check (direction in ('IN', 'OUT')),
  amount_minor_units bigint not null check (amount_minor_units > 0),
  source_type text,
  source_reference text,
  compensates_movement_id uuid references cash_movements (id),
  idempotency_key text,
  actor text not null,
  reason text,
  ledger_revision integer not null,
  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);
create index cash_movements_session_idx on cash_movements (cash_session_id, ledger_revision);
-- Per-register sourceReference dedup (SPEC-125 stable convergence).
create unique index cash_movements_register_source_ref
  on cash_movements (tenant_id, cash_register_id, source_reference)
  where source_reference is not null;

create table cash_reconciliations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  cash_register_id uuid not null references cash_registers (id),
  cash_session_id uuid not null references cash_sessions (id),
  currency text not null,
  ledger_revision integer not null,
  attempt integer not null default 1,
  counted_minor_units bigint,
  expected_minor_units bigint not null,
  difference_minor_units bigint,
  status text not null check (status in ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
  prepared_by text not null,
  prepared_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cash_reconciliations_session_idx on cash_reconciliations (cash_session_id);

create table cash_discounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  name text not null,
  type text not null check (type in ('FIXED', 'PERCENTAGE')),
  value bigint not null check (value > 0),
  scope text not null,
  valid_from timestamptz,
  valid_until timestamptz,
  status text not null check (status in ('DRAFT', 'PUBLISHED', 'DEACTIVATED')),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cash_discounts_tenant_idx on cash_discounts (tenant_id);

create table cash_discount_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  discount_id uuid not null references cash_discounts (id),
  discount_version integer not null,
  discount_type text not null check (discount_type in ('FIXED', 'PERCENTAGE')),
  order_id uuid,
  check_id uuid,
  eligible_base_minor_units bigint not null,
  applied_amount_minor_units bigint not null,
  currency text not null,
  actor_ref text not null,
  reason_code text,
  created_at timestamptz not null default now(),
  check (order_id is not null or check_id is not null)
);
create index cash_discount_applications_order_idx on cash_discount_applications (tenant_id, order_id);
create index cash_discount_applications_check_idx on cash_discount_applications (tenant_id, check_id);

alter table cash_registers enable row level security;
alter table cash_sessions enable row level security;
alter table cash_movements enable row level security;
alter table cash_reconciliations enable row level security;
alter table cash_discounts enable row level security;
alter table cash_discount_applications enable row level security;

create policy tenant_isolation on cash_registers
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on cash_sessions
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on cash_movements
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on cash_reconciliations
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on cash_discounts
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on cash_discount_applications
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  cash_registers, cash_sessions, cash_movements, cash_reconciliations,
  cash_discounts, cash_discount_applications
to service_role;
