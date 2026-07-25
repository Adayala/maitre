create table if not exists workforce_time_export_jobs (
  id uuid primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  status text not null check (status in ('REQUESTED')),
  format text not null check (format in ('CSV')),
  from_at timestamptz not null,
  to_at timestamptz not null,
  reason text not null,
  requested_at timestamptz not null,
  step_up_at timestamptz not null,
  requested_by_user_id uuid not null references users(id) on delete restrict,
  manifest jsonb not null default '{}'::jsonb
);

create index if not exists workforce_time_export_jobs_tenant_branch_requested_idx
  on workforce_time_export_jobs (tenant_id, branch_id, requested_at desc);
