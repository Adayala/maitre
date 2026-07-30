alter table fiscal_invoice_deliveries
  drop constraint if exists fiscal_invoice_deliveries_status_check;

alter table fiscal_invoice_deliveries
  add constraint fiscal_invoice_deliveries_status_check
  check (status in ('QUEUED', 'PROCESSING', 'SENT', 'FAILED'));
