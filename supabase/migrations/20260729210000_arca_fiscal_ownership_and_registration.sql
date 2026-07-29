-- ARCA/WSFE ownership, establishment registration and durable authorization attempts.
-- Existing subscriptions and POS records are intentionally NOT guessed: operators
-- must associate them explicitly before production emission is enabled.

alter table public.organization_fiscal_entities
  add column if not exists legal_name text,
  add column if not exists display_name text;

update public.organization_fiscal_entities
set legal_name = name
where legal_name is null;

alter table public.organization_fiscal_entities
  alter column legal_name set not null,
  add constraint organization_fiscal_entities_legal_name_len_chk
    check (char_length(legal_name) between 3 and 200);

alter table public.subscription_subscriptions
  add column if not exists subscriber_fiscal_entity_id uuid;

alter table public.subscription_subscriptions
  add constraint subscription_subscriber_fiscal_entity_fk
  foreign key (tenant_id, subscriber_fiscal_entity_id)
  references public.organization_fiscal_entities (tenant_id, id);

alter table public.fiscal_points_of_sale
  add column if not exists branch_id uuid,
  add column if not exists arca_domicile_code text,
  add column if not exists arca_domicile_label text,
  add column if not exists issuing_system text not null default 'WSFEV1',
  add column if not exists registration_status text not null default 'DECLARED',
  add column if not exists registration_evidence_ref text,
  add column if not exists declared_at timestamptz,
  add column if not exists declared_by uuid,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid,
  add column if not exists rejection_reason text;

alter table public.fiscal_points_of_sale
  add constraint fiscal_pos_branch_tenant_fk
    foreign key (tenant_id, branch_id)
    references public.organization_branches (tenant_id, id),
  add constraint fiscal_pos_issuing_system_chk
    check (issuing_system in ('WSFEV1', 'CONTROLLER_FISCAL', 'COMPROBANTES_EN_LINEA', 'OTHER')),
  add constraint fiscal_pos_registration_status_chk
    check (registration_status in ('DECLARED', 'VERIFIED', 'REJECTED', 'INACTIVE')),
  add constraint fiscal_pos_verified_evidence_chk
    check (
      registration_status <> 'VERIFIED'
      or (registration_evidence_ref is not null and verified_at is not null)
    );

create table public.fiscal_authorization_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organization_tenants (id),
  invoice_id uuid not null references public.fiscal_invoices (id),
  fiscal_entity_id uuid not null references public.organization_fiscal_entities (id),
  point_of_sale_id uuid not null references public.fiscal_points_of_sale (id),
  environment text not null check (environment in ('HOMOLOGATION', 'PRODUCTION')),
  voucher_type text not null,
  requested_number bigint not null check (requested_number > 0),
  request_hash text not null,
  status text not null check (
    status in ('CREATED', 'DISPATCHED', 'AUTHORIZED', 'REJECTED', 'PENDING_RECONCILIATION')
  ),
  provider_ref text,
  response_codes jsonb not null default '[]'::jsonb,
  rejection_reason text,
  created_at timestamptz not null default now(),
  dispatched_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id, fiscal_entity_id, environment, point_of_sale_id, voucher_type, requested_number)
);

create index fiscal_authorization_attempts_reconciliation_idx
  on public.fiscal_authorization_attempts (tenant_id, status, updated_at)
  where status in ('CREATED', 'DISPATCHED', 'PENDING_RECONCILIATION');

alter table public.fiscal_authorization_attempts enable row level security;
create policy tenant_isolation on public.fiscal_authorization_attempts
  using (tenant_id::text = current_setting('app.tenant_id', true))
  with check (tenant_id::text = current_setting('app.tenant_id', true));

grant select, insert, update, delete
  on public.fiscal_authorization_attempts
  to service_role;

comment on column public.subscription_subscriptions.subscriber_fiscal_entity_id is
  'Explicit fiscal owner of the subscription. Null means legacy onboarding is incomplete; never infer from a branch.';
comment on column public.fiscal_points_of_sale.registration_evidence_ref is
  'Non-secret reference to evidence from ARCA Administración de Puntos de Venta y Domicilios.';
