create table if not exists workforce_labor_policy_versions (
  id uuid primary key,
  tenant_id uuid not null references organization_tenants(id) on delete cascade,
  branch_id uuid not null references organization_branches(id) on delete cascade,
  jurisdiction_code text not null,
  source_type text not null check (source_type in ('OFFICIAL', 'COUNSEL', 'INTERNAL_APPROVED_REFERENCE')),
  source_ref text not null,
  consulted_at timestamptz not null,
  effective_from timestamptz not null,
  effective_until timestamptz null,
  content_hash text not null,
  reviewer_ref text not null,
  approved_at timestamptz not null,
  supersedes_policy_version_id uuid null references workforce_labor_policy_versions(id) on delete set null,
  policy_capabilities jsonb not null default '{}'::jsonb,
  disclaimer text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists workforce_labor_policy_versions_tenant_branch_idx
  on workforce_labor_policy_versions (tenant_id, branch_id, effective_from desc);
