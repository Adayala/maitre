-- Fiscal domain (SPEC-139..155): points of sale, printers, certificates,
-- invoice templates, tax rates and invoices.
--
-- Notes / current scope:
--   - organization_fiscal_entities already exists as part of Organization and is
--     extended by its own migration (SPEC-003/009). This file adds the missing
--     fiscal-operational tables consumed by the fiscal adapters and routes.
--   - Private keys / certificate material never live here: certificates store
--     metadata plus an opaque secret reference only.
--   - ARCA authorization remains simulated in code; this schema supports the
--     documented MVP workflows without implying real fiscal compliance.

create table if not exists fiscal_points_of_sale (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  fiscal_entity_id uuid not null references organization_fiscal_entities (id),
  environment text not null check (environment in ('HOMOLOGATION', 'PRODUCTION')),
  official_code text not null check (char_length(official_code) between 1 and 32),
  allowed_voucher_types jsonb not null default '[]'::jsonb,
  status text not null check (status in ('ACTIVE', 'INACTIVE')),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, fiscal_entity_id, environment, official_code)
);
create index if not exists fiscal_points_of_sale_fiscal_entity_idx
  on fiscal_points_of_sale (tenant_id, fiscal_entity_id, official_code);

create table if not exists fiscal_printers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  branch_id uuid not null references organization_branches (id),
  provider text not null,
  model text not null,
  device_id text not null,
  capabilities jsonb not null default '[]'::jsonb,
  config_secret_ref text,
  config_version integer not null default 1 check (config_version > 0),
  health_snapshot jsonb,
  status text not null check (status in ('ACTIVE', 'DEGRADED', 'OFFLINE', 'RETIRED')),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, branch_id, device_id)
);
create index if not exists fiscal_printers_branch_idx
  on fiscal_printers (tenant_id, branch_id, created_at);

create table if not exists fiscal_certificates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  fiscal_entity_id uuid not null references organization_fiscal_entities (id),
  cuit text not null check (cuit ~ '^[0-9]{11}$'),
  service text not null,
  environment text not null check (environment in ('HOMOLOGATION', 'PRODUCTION')),
  fingerprint text not null,
  issuer text not null,
  not_before timestamptz not null,
  not_after timestamptz not null,
  status text not null check (status in ('ACTIVE', 'EXPIRED', 'REVOKED')),
  secret_reference text not null,
  rotated_at timestamptz,
  superseded_by uuid references fiscal_certificates (id),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not_after > not_before),
  unique (tenant_id, fiscal_entity_id, service, environment, fingerprint)
);
create index if not exists fiscal_certificates_fiscal_entity_idx
  on fiscal_certificates (tenant_id, fiscal_entity_id, created_at);

create table if not exists fiscal_invoice_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid references organization_brands (id),
  name text not null check (char_length(name) between 1 and 160),
  channel text not null,
  status text not null check (status in ('DRAFT', 'PUBLISHED', 'DEACTIVATED')),
  content_ref text not null,
  variable_schema_version integer not null check (variable_schema_version > 0),
  layout_normative_version text not null,
  published_at timestamptz,
  published_by text,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fiscal_invoice_templates_tenant_idx
  on fiscal_invoice_templates (tenant_id, created_at);

create table if not exists fiscal_tax_rates (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  tax_type text not null,
  official_code text not null,
  treatment text not null check (treatment in ('TAXED', 'EXEMPT', 'NON_TAXED')),
  decimal_rate integer not null check (decimal_rate >= 0),
  included_in_price boolean not null default false,
  effective_from timestamptz not null,
  effective_to timestamptz,
  normative_source_version text not null,
  status text not null check (status in ('DRAFT', 'PUBLISHED')),
  supersedes uuid references fiscal_tax_rates (id),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from),
  check ((treatment = 'TAXED') or decimal_rate = 0),
  unique (jurisdiction, tax_type, official_code, effective_from)
);
create index if not exists fiscal_tax_rates_lookup_idx
  on fiscal_tax_rates (jurisdiction, tax_type, official_code, effective_from);

create table if not exists fiscal_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  fiscal_entity_id uuid not null references organization_fiscal_entities (id),
  environment text not null check (environment in ('HOMOLOGATION', 'PRODUCTION')),
  point_of_sale_id uuid not null references fiscal_points_of_sale (id),
  voucher_type text not null check (
    voucher_type in (
      'FACTURA_A', 'FACTURA_B', 'FACTURA_C',
      'NOTA_CREDITO_A', 'NOTA_CREDITO_B', 'NOTA_CREDITO_C',
      'NOTA_DEBITO_A', 'NOTA_DEBITO_B', 'NOTA_DEBITO_C'
    )
  ),
  number integer,
  status text not null check (
    status in (
      'DRAFT', 'VALIDATED', 'AUTHORIZATION_PENDING', 'AUTHORIZED',
      'REJECTED', 'PENDING_RECONCILIATION', 'VOIDED_DRAFT'
    )
  ),
  currency text not null,
  recipient jsonb,
  line_items jsonb not null default '[]'::jsonb,
  totals jsonb not null,
  source_check_id uuid,
  source_check_revision integer,
  linked_invoice_id uuid references fiscal_invoices (id),
  authorization_provider_ref text,
  cae text,
  cae_expires_at timestamptz,
  rejection_reason text,
  normative_version text not null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  validated_at timestamptz,
  authorized_at timestamptz
);
create index if not exists fiscal_invoices_tenant_fiscal_entity_idx
  on fiscal_invoices (tenant_id, fiscal_entity_id, created_at);
create unique index if not exists fiscal_invoices_numbering_uq
  on fiscal_invoices (tenant_id, fiscal_entity_id, environment, point_of_sale_id, voucher_type, number)
  where number is not null;

alter table fiscal_points_of_sale enable row level security;
alter table fiscal_printers enable row level security;
alter table fiscal_certificates enable row level security;
alter table fiscal_invoice_templates enable row level security;
alter table fiscal_tax_rates enable row level security;
alter table fiscal_invoices enable row level security;

create policy tenant_isolation on fiscal_points_of_sale
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on fiscal_printers
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on fiscal_certificates
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on fiscal_invoice_templates
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy allow_all_read on fiscal_tax_rates
  for select
  using (true);
create policy tenant_isolation on fiscal_invoices
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  fiscal_points_of_sale,
  fiscal_printers,
  fiscal_certificates,
  fiscal_invoice_templates,
  fiscal_tax_rates,
  fiscal_invoices
to service_role;
