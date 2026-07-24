-- Reservations domain (SPEC-066..080): Reservation, Guest, WaitlistEntry,
-- ReservationPreference, CancellationPolicy, NotificationIntent. Simplified
-- "CRUD simple + invariantes clave" scope — see
-- packages/modules/reservations/src/domain/*.ts for the documented
-- deferred gaps (no separate CapacityHold/Allocation ledger — PENDING
-- reservations do not block capacity; no Guest per-field consent
-- ledger/merge; simplified single-record CancellationPolicy; FIFO +
-- manual priorityOverride Waitlist ordering; no async export/notification
-- delivery pipeline).

create table reservations_reservations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  guest_id uuid,
  party_size integer not null check (party_size > 0),
  start_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  source text not null default 'INTERNAL',
  status text not null check (
    status in ('PENDING', 'CONFIRMED', 'EXPIRED', 'SEATED', 'CANCELLED', 'NO_SHOW', 'COMPLETED')
  ),
  table_ids uuid[],
  visit_id uuid,
  cancellation_policy_id uuid,
  cancel_reason text,
  cancelled_at timestamptz,
  no_show_reason text,
  notes text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reservations_guests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  display_name text not null,
  email text,
  phone text,
  locale text,
  consent_given boolean not null default false,
  notes text,
  status text not null check (status in ('ACTIVE', 'ANONYMIZED')),
  anonymized_at timestamptz,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reservations_reservations
  add constraint reservations_reservations_guest_id_fkey
  foreign key (guest_id) references reservations_guests (id);

create table reservations_waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  guest_id uuid references reservations_guests (id),
  party_size integer not null check (party_size > 0),
  arrived_at timestamptz not null default now(),
  quoted_minutes integer,
  priority_override integer not null default 0,
  override_reason text,
  status text not null check (status in ('WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'EXPIRED')),
  notified_at timestamptz,
  seated_at timestamptz,
  visit_id uuid,
  cancel_reason text,
  notes text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reservations_preferences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  subject_type text not null check (subject_type in ('GUEST', 'RESERVATION')),
  subject_id uuid not null,
  code text not null,
  value text,
  kind text not null check (kind in ('PREFERENCE', 'REQUIREMENT')),
  notes text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SPEC-070 simplified: one CancellationPolicy record per tenant.
create table reservations_cancellation_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references organization_tenants (id),
  name text not null,
  hours_before_start_cutoff integer not null check (hours_before_start_cutoff >= 0),
  fee_description text,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SPEC-075 simplified: no real delivery, just a record + outbox event.
create table reservations_notification_intents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  reservation_id uuid not null references reservations_reservations (id),
  purpose text not null check (
    purpose in ('REQUEST_CONFIRMATION', 'SEND_REMINDER', 'COMMUNICATE_CANCELLATION')
  ),
  status text not null check (status in ('CREATED')),
  created_at timestamptz not null default now()
);

alter table reservations_reservations enable row level security;
alter table reservations_guests enable row level security;
alter table reservations_waitlist_entries enable row level security;
alter table reservations_preferences enable row level security;
alter table reservations_cancellation_policies enable row level security;
alter table reservations_notification_intents enable row level security;

create policy tenant_isolation on reservations_reservations
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on reservations_guests
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on reservations_waitlist_entries
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on reservations_preferences
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on reservations_cancellation_policies
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on reservations_notification_intents
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  reservations_reservations, reservations_guests, reservations_waitlist_entries,
  reservations_preferences, reservations_cancellation_policies, reservations_notification_intents
to service_role;
