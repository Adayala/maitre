-- Audit domain (SPEC-044): append-only audit_logs. No UPDATE/DELETE grants
-- to service_role — writes are insert-only, matching "Eventos no se
-- actualizan ni borran mediante API común" (SPEC-044 §contract).

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  actor_type text not null check (actor_type in ('USER', 'SYSTEM')),
  actor_id uuid,
  action text not null check (action in ('CREATE', 'UPDATE', 'DELETE')),
  resource_type text not null,
  resource_id uuid not null,
  previous_state jsonb,
  new_state jsonb,
  correlation_id uuid,
  occurred_at timestamptz not null default now()
);

create index audit_logs_tenant_occurred_idx on audit_logs (tenant_id, occurred_at desc, id desc);
create index audit_logs_actor_idx on audit_logs (tenant_id, actor_id);
create index audit_logs_resource_type_idx on audit_logs (tenant_id, resource_type);

alter table audit_logs enable row level security;

create policy tenant_isolation on audit_logs
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

-- Insert-only: no update/delete granted, matching the append-only contract.
grant select, insert on audit_logs to service_role;
