create table if not exists fiscal_invoice_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  invoice_id uuid not null references fiscal_invoices (id),
  channel text not null check (channel = 'EMAIL'),
  recipient_email text not null check (recipient_email ~* '^[^@[:space:]]+@[^@[:space:]]+$'),
  format text not null check (format in ('PDF', 'HTML')),
  idempotency_key text not null check (char_length(idempotency_key) between 1 and 200),
  status text not null check (status in ('QUEUED', 'SENT', 'FAILED')),
  attempts integer not null default 0 check (attempts >= 0),
  sent_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create index if not exists fiscal_invoice_deliveries_invoice_idx
  on fiscal_invoice_deliveries (tenant_id, invoice_id, created_at);

alter table fiscal_invoice_deliveries enable row level security;
create policy tenant_isolation on fiscal_invoice_deliveries
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
grant select, insert, update on fiscal_invoice_deliveries to service_role;
