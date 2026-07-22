import { randomUUID } from "node:crypto";
import {
  InMemoryTenantRepository,
  InMemoryBranchRepository,
  InMemoryBrandRepository,
  InMemoryUserRepository,
  InMemoryMembershipRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";
import { createBrand } from "@maitre/organization";
import type { Tenant } from "@maitre/organization";
import type { Branch } from "@maitre/organization";
import type { User, Membership } from "@maitre/identity";

export interface Container {
  tenants: InMemoryTenantRepository;
  branches: InMemoryBranchRepository;
  brands: InMemoryBrandRepository;
  users: InMemoryUserRepository;
  memberships: InMemoryMembershipRepository;
  sessions: FixtureSessionVerificationPort;
  demoAccessToken: string;
}

/**
 * Builds the composition root for I0. Repositories are in-memory fixtures
 * (SPEC-210 marks Supabase Postgres/Auth as pending SPK-02/03/04/06); seeded
 * data is synthetic only, per SPEC-213 "no objetivo: usar datos productivos".
 */
export async function buildContainer(): Promise<Container> {
  const tenants = new InMemoryTenantRepository();
  const branches = new InMemoryBranchRepository();
  const brands = new InMemoryBrandRepository();
  const users = new InMemoryUserRepository();
  const memberships = new InMemoryMembershipRepository();
  const sessions = new FixtureSessionVerificationPort();

  const now = new Date();

  const tenant: Tenant = {
    id: randomUUID(),
    name: "Maitre Demo Tenant",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  };
  await tenants.save(tenant);

  const brand = await createBrand(
    { tenants, brands, now: () => now },
    {
      tenantId: tenant.id,
      name: "Maitre Demo Brand",
      config: { language: "es", currency: tenant.defaultCurrency },
    },
  );

  const branch: Branch = {
    id: randomUUID(),
    tenantId: tenant.id,
    brandId: brand.id,
    code: "MAIN",
    name: "Sucursal Principal",
    timezone: tenant.defaultTimezone,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  await branches.save(branch);

  const user: User = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-owner",
    displayName: "Demo Owner",
    email: "owner@demo.maitre",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  await users.save(user);

  const membership: Membership = {
    id: randomUUID(),
    tenantId: tenant.id,
    userId: user.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await memberships.save(membership);

  const demoAccessToken = "demo-token";
  const issuedAt = now;
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  sessions.registerToken(demoAccessToken, {
    provider: "fixture",
    subject: "demo-owner",
    ...(user.email ? { email: user.email } : {}),
    emailVerified: true,
    issuedAt,
    expiresAt,
  });

  return { tenants, branches, brands, users, memberships, sessions, demoAccessToken };
}
