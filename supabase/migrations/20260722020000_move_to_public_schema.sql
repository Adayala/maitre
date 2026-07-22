-- The Data API "Exposed schemas" toggle for a custom schema ("maitre")
-- was unreliable in the dashboard UI, and the Management API token used
-- for migrations lacks privilege to change PostgREST config directly
-- (403 on PATCH /v1/projects/{ref}/postgrest). public is already exposed
-- with zero extra steps, so tables move there with module prefixes to
-- keep the boundary legible (SPEC-209) without a Postgres schema.

alter table maitre.organization_tenants set schema public;
alter table maitre.organization_brands set schema public;
alter table maitre.organization_fiscal_entities set schema public;
alter table maitre.organization_branches set schema public;
alter table maitre.organization_salons set schema public;
alter table maitre.organization_tables set schema public;

alter table maitre.identity_users set schema public;
alter table maitre.identity_memberships set schema public;
alter table maitre.identity_membership_roles set schema public;
alter table maitre.identity_membership_branches set schema public;

alter table maitre.platform_outbox set schema public;

drop schema maitre;
