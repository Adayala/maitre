-- Initial schema for Organization (SPEC-001..006), Identity (SPEC-017/018/020)
-- and the SPEC-217 transactional outbox (SPEC-013/014/015 events).
--
-- Conventions (SPEC-210): snake_case columns, camelCase mapped in the
-- repository layer; timestamptz everywhere; explicit tenant_id on every
-- tenant-scoped table; composite (tenant_id, id) foreign keys so a row can
-- only reference another row of the same tenant (SPEC-004 §5); RLS enabled
-- as defense in depth even though I0's backend connects with the service
-- role (which bypasses RLS) — see SPEC-210 §Multi-tenancy.

create extension if not exists pgcrypto;

create schema if not exists organization;
create schema if not exists identity;
create schema if not exists platform;

-- =========================================================================
-- organization.tenants — SPEC-001
-- =========================================================================
create table organization.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  status text not null check (status in ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  default_locale text not null,
  default_currency char(3) not null,
  default_timezone text not null,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- =========================================================================
-- organization.brands — SPEC-002
-- =========================================================================
create table organization.brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  name text not null check (char_length(name) between 3 and 100),
  slug text not null,
  description text,
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  logo_url text,
  website text,
  default_menu_id uuid,
  config_language char(2) not null,
  config_currency char(3) not null,
  config_cancellation_policy text,
  config_brand_voice text,
  config_allergen_policy text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  unique (tenant_id, slug),
  unique (tenant_id, id)
);

-- =========================================================================
-- organization.fiscal_entities — SPEC-003
-- =========================================================================
create table organization.fiscal_entities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  cuit text not null check (cuit ~ '^[0-9]{11}$'),
  name text not null check (char_length(name) between 3 and 200),
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  tax_condition text not null check (tax_condition in ('RI', 'MONOTRIBUTISTA', 'EXENTO')),
  certificate_serial text,
  certificate_subject text,
  certificate_issuer text,
  certificate_valid_from timestamptz,
  certificate_valid_to timestamptz,
  certificate_thumbprint text,
  encrypted_certificate_key_ref text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, cuit),
  unique (tenant_id, id)
);

-- =========================================================================
-- organization.branches — SPEC-004
-- =========================================================================
create table organization.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  brand_id uuid not null,
  fiscal_entity_id uuid,
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'),
  name text not null check (char_length(name) between 1 and 120),
  timezone text not null,
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  address_line1 text,
  address_line2 text,
  address_city text,
  address_subdivision text,
  address_postal_code text,
  address_country_code char(2),
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, code),
  unique (tenant_id, id),
  foreign key (tenant_id, brand_id) references organization.brands (tenant_id, id),
  foreign key (tenant_id, fiscal_entity_id) references organization.fiscal_entities (tenant_id, id)
);

-- =========================================================================
-- organization.salons — SPEC-005
-- =========================================================================
create table organization.salons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  branch_id uuid not null,
  name text not null check (char_length(name) between 1 and 50),
  capacity integer not null check (capacity > 0),
  description text,
  status text not null check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, id),
  foreign key (tenant_id, branch_id) references organization.branches (tenant_id, id)
);

-- =========================================================================
-- organization.tables — SPEC-006 (status is DERIVED, never persisted)
-- =========================================================================
create table organization.tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  branch_id uuid not null,
  salon_id uuid not null,
  number text not null check (char_length(number) between 1 and 10),
  name text,
  capacity integer not null check (capacity between 1 and 20),
  location_floor integer,
  location_zone text,
  feature_wheelchair_accessible boolean,
  feature_power_outlet boolean,
  feature_outdoors boolean,
  shape text check (shape in ('ROUND', 'RECTANGULAR', 'SQUARE', 'IRREGULAR')),
  min_duration_minutes integer check (min_duration_minutes >= 30),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, salon_id, number),
  foreign key (tenant_id, salon_id) references organization.salons (tenant_id, id)
);

-- =========================================================================
-- identity.users — SPEC-017 (global; NOT tenant-scoped — a User's identity
-- is independent of tenant membership, per SPEC-001 §5)
-- =========================================================================
create table identity.users (
  id uuid primary key default gen_random_uuid(),
  identity_provider text not null,
  external_identity_id text not null,
  display_name text not null check (char_length(display_name) between 1 and 100),
  email text,
  status text not null check (status in ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  suspended_at timestamptz,
  deactivated_at timestamptz,
  unique (identity_provider, external_identity_id)
);

-- =========================================================================
-- identity.memberships — SPEC-020
-- =========================================================================
create table identity.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization.tenants (id),
  user_id uuid not null references identity.users (id),
  status text not null check (status in ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED')),
  branch_scope_type text not null check (branch_scope_type in ('ALL_BRANCHES', 'SELECTED_BRANCHES')),
  invited_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, user_id),
  unique (tenant_id, id)
);

-- roleIds / branchIds are DTO-level arrays (SPEC-020); persistence uses
-- normalized tables.
create table identity.membership_roles (
  membership_id uuid not null references identity.memberships (id) on delete cascade,
  role_id text not null,
  primary key (membership_id, role_id)
);

create table identity.membership_branches (
  membership_id uuid not null references identity.memberships (id) on delete cascade,
  branch_id uuid not null,
  primary key (membership_id, branch_id)
);

-- =========================================================================
-- platform.outbox — SPEC-217 §4 (transactional outbox)
-- =========================================================================
create table platform.outbox (
  event_id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_version integer not null check (event_version > 0),
  occurred_at timestamptz not null,
  producer text not null,
  tenant_id uuid not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  correlation_id uuid not null,
  causation_id uuid,
  payload jsonb not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED')),
  attempts integer not null default 0,
  lease_owner text,
  lease_expires_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index outbox_status_idx on platform.outbox (status, created_at);
create index outbox_aggregate_idx on platform.outbox (aggregate_type, aggregate_id);

-- =========================================================================
-- Row-Level Security — defense in depth (SPEC-210 §Multi-tenancy).
-- The Fastify backend connects with the service role and bypasses RLS;
-- these policies protect against any future direct PostgREST/anon access.
-- =========================================================================
alter table organization.tenants enable row level security;
alter table organization.brands enable row level security;
alter table organization.fiscal_entities enable row level security;
alter table organization.branches enable row level security;
alter table organization.salons enable row level security;
alter table organization.tables enable row level security;
alter table identity.memberships enable row level security;

create policy tenant_isolation on organization.tenants
  using (id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on organization.brands
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on organization.fiscal_entities
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on organization.branches
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on organization.salons
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on organization.tables
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on identity.memberships
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

-- identity.users is intentionally global — no RLS tenant policy (see table comment).
alter table identity.users enable row level security;
create policy service_role_only on identity.users using (false);
-- ^ no anon/authenticated policy exists, so only the service role (which
-- bypasses RLS) can read/write; this is deliberate until SPEC-021/023 define
-- a narrower self-service policy for authenticated users.
