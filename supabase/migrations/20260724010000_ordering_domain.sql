-- Ordering domain (SPEC-081..097): Order (+ embedded OrderItem/OrderModifier/
-- OrderAdjustment JSONB), CapabilityToken (MENU_READ/BILL_READ/ORDER_TRACK_READ),
-- KitchenTicket, SpecialRequest. Simplified "CRUD simple + invariantes clave"
-- scope — see packages/modules/ordering/src/domain/*.ts for the documented
-- deferred gaps:
--   - OrderItem is embedded JSONB on the Order row (no separate table), mirroring
--     the Floor Check(lines/adjustments) precedent; no partial-quantity
--     allocation model, one status per item.
--   - Order.status is an explicit stored field updated via SPEC-081 derivation,
--     not computed-on-read; taxTotal is always 0 (no TaxPolicy engine).
--   - OrderAdjustment is a simple audit sub-record, NOT the full SPEC-089
--     PENDING/APPLIED/REJECTED/COMPENSATION_REQUIRED saga.
--   - Capability tokens are opaque random tokens stored ONLY as a SHA-256 hash
--     (hash-at-rest, real); rotation/rate-limiting/ETag/cache-freeze deferred.
--   - KitchenTicket is a BASIC placeholder (one per Order, ticket-level status)
--     to be superseded by the real Kitchen domain (SPEC-098..110).
--   - SpecialRequest stores purpose/visibility/retention/consent as absent
--     (deferred); free text is normalized/capped plain text.

create table ordering_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  visit_id uuid not null,
  currency text not null,
  items jsonb not null default '[]'::jsonb,
  adjustments jsonb not null default '[]'::jsonb,
  status text not null check (
    status in ('DRAFT', 'SUBMITTED', 'IN_PREP', 'READY', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED')
  ),
  catalog_revision_id uuid,
  notes text,
  subtotal_minor_units bigint not null default 0,
  tax_total_minor_units bigint not null default 0,
  grand_total_minor_units bigint not null default 0,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  cancelled_at timestamptz
);

-- One unified capability table for all three public purposes, discriminated by
-- `purpose`. Only the SHA-256 hash is stored; the raw token never lands here.
create table ordering_capability_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  purpose text not null check (purpose in ('MENU_READ', 'BILL_READ', 'ORDER_TRACK_READ')),
  token_hash text not null unique,
  resource_type text not null check (resource_type in ('MENU', 'CHECK', 'ORDER')),
  resource_id uuid not null,
  branch_id uuid,
  table_id uuid,
  status text not null check (status in ('ACTIVE', 'REVOKED', 'EXPIRED')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ordering_kitchen_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  visit_id uuid not null,
  order_id uuid not null references ordering_orders (id),
  order_revision integer not null,
  status text not null check (status in ('QUEUED', 'IN_PREP', 'READY', 'COMPLETED', 'CANCELLED')),
  lines jsonb not null default '[]'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz
);

create table ordering_special_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid,
  request_type text not null,
  target_type text not null check (target_type in ('RESERVATION', 'VISIT', 'ORDER')),
  target_id uuid not null,
  status text not null check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED')),
  free_text text,
  created_by_actor text,
  resolved_by_actor text,
  reason_code text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table ordering_orders enable row level security;
alter table ordering_capability_tokens enable row level security;
alter table ordering_kitchen_tickets enable row level security;
alter table ordering_special_requests enable row level security;

create policy tenant_isolation on ordering_orders
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
-- Capability tokens are resolved by the public (anonymous) surface via the
-- service role, which bypasses RLS; the policy still scopes any tenant-context
-- reads. The token hash lookup is intentionally tenant-agnostic (see the
-- repository), matching the anti-enumeration public-resolve requirement.
create policy tenant_isolation on ordering_capability_tokens
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on ordering_kitchen_tickets
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on ordering_special_requests
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  ordering_orders, ordering_capability_tokens, ordering_kitchen_tickets, ordering_special_requests
to service_role;
