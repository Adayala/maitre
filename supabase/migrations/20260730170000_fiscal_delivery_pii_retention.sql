alter table fiscal_invoice_deliveries
  alter column recipient_email drop not null;

alter table fiscal_invoice_deliveries
  add column if not exists redacted_at timestamptz;

alter table fiscal_invoice_deliveries
  add constraint fiscal_invoice_deliveries_recipient_retention_check
  check (
    (recipient_email is not null and redacted_at is null)
    or
    (recipient_email is null and redacted_at is not null and status = 'SENT')
  );

create index if not exists fiscal_invoice_deliveries_retention_idx
  on fiscal_invoice_deliveries (sent_at)
  where status = 'SENT' and recipient_email is not null;
