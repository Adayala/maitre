alter table public.organization_fiscal_entities
  add column if not exists legal_address text,
  add column if not exists fiscal_address text,
  add column if not exists activity_code text,
  add column if not exists create_idempotency_key text;

alter table public.organization_fiscal_entities
  add constraint organization_fiscal_entities_legal_address_len_chk
    check (legal_address is null or char_length(legal_address) between 1 and 300) not valid,
  add constraint organization_fiscal_entities_fiscal_address_len_chk
    check (fiscal_address is null or char_length(fiscal_address) between 1 and 300) not valid,
  add constraint organization_fiscal_entities_activity_code_len_chk
    check (activity_code is null or char_length(activity_code) between 1 and 64) not valid;

create unique index if not exists organization_fiscal_entities_tenant_create_idempotency_key_uq
  on public.organization_fiscal_entities (tenant_id, create_idempotency_key)
  where create_idempotency_key is not null;
