-- Consolidates organization/identity/platform into a single "maitre" schema
-- so it can be exposed to PostgREST with one toggle (Project Settings >
-- Data API > Exposed schemas), instead of three. Table names stay
-- module-prefixed to avoid collisions and keep the module boundary legible
-- (SPEC-209) even without separate Postgres schemas.

create schema if not exists maitre;

alter table organization.tenants rename to organization_tenants;
alter table organization.brands rename to organization_brands;
alter table organization.fiscal_entities rename to organization_fiscal_entities;
alter table organization.branches rename to organization_branches;
alter table organization.salons rename to organization_salons;
alter table organization.tables rename to organization_tables;

alter table identity.users rename to identity_users;
alter table identity.memberships rename to identity_memberships;
alter table identity.membership_roles rename to identity_membership_roles;
alter table identity.membership_branches rename to identity_membership_branches;

alter table platform.outbox rename to platform_outbox;

alter table organization.organization_tenants set schema maitre;
alter table organization.organization_brands set schema maitre;
alter table organization.organization_fiscal_entities set schema maitre;
alter table organization.organization_branches set schema maitre;
alter table organization.organization_salons set schema maitre;
alter table organization.organization_tables set schema maitre;

alter table identity.identity_users set schema maitre;
alter table identity.identity_memberships set schema maitre;
alter table identity.identity_membership_roles set schema maitre;
alter table identity.identity_membership_branches set schema maitre;

alter table platform.platform_outbox set schema maitre;

drop schema organization;
drop schema identity;
drop schema platform;
