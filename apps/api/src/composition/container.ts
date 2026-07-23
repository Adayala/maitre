import {
  InMemoryTenantRepository,
  InMemoryBranchRepository,
  InMemoryBrandRepository,
  InMemoryFiscalEntityRepository,
  InMemorySalonRepository,
  InMemoryTableRepository,
  InMemoryUserRepository,
  InMemoryMembershipRepository,
  InMemoryOutboxRepository,
  InMemorySubscriptionRepository,
  InMemorySubscriptionItemRepository,
  InMemoryEntitlementRepository,
  InMemoryQuotaRepository,
  InMemoryMenuRepository,
  InMemoryCategoryRepository,
  InMemoryProductRepository,
  InMemoryAuditLogRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";
import {
  createSupabaseClient,
  SupabaseTenantRepository,
  SupabaseBrandRepository,
  SupabaseFiscalEntityRepository,
  SupabaseBranchRepository,
  SupabaseSalonRepository,
  SupabaseTableRepository,
  SupabaseUserRepository,
  SupabaseMembershipRepository,
  SupabaseOutboxRepository,
  SupabaseSubscriptionRepository,
  SupabaseSubscriptionItemRepository,
  SupabaseEntitlementRepository,
  SupabaseQuotaRepository,
  SupabaseMenuRepository,
  SupabaseCategoryRepository,
  SupabaseProductRepository,
  SupabaseAuditLogRepository,
} from "@maitre/adapter-persistence-supabase";
import {
  createTenant,
  createBrand,
  createBranch,
  createSalon,
  createTable,
  type TenantRepositoryPort,
  type BrandRepositoryPort,
  type FiscalEntityRepositoryPort,
  type BranchRepositoryPort,
  type SalonRepositoryPort,
  type TableRepositoryPort,
  type OutboxPort,
} from "@maitre/organization";
import {
  createMembership,
  type UserRepositoryPort,
  type MembershipRepositoryPort,
  type SessionVerificationPort,
} from "@maitre/identity";
import { SupabaseSessionVerificationPort } from "@maitre/adapter-identity-supabase-auth";
import {
  createSubscription,
  type SubscriptionRepositoryPort,
  type SubscriptionItemRepositoryPort,
  type EntitlementRepositoryPort,
  type QuotaRepositoryPort,
} from "@maitre/subscription";
import {
  createMenu,
  createCategory,
  createProduct,
  type MenuRepositoryPort,
  type CategoryRepositoryPort,
  type ProductRepositoryPort,
} from "@maitre/catalog";
import type { AuditLogRepositoryPort } from "@maitre/audit";

export interface Container {
  tenants: TenantRepositoryPort;
  branches: BranchRepositoryPort;
  brands: BrandRepositoryPort;
  fiscalEntities: FiscalEntityRepositoryPort;
  salons: SalonRepositoryPort;
  tables: TableRepositoryPort;
  users: UserRepositoryPort;
  memberships: MembershipRepositoryPort;
  outbox: OutboxPort;
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  quotas: QuotaRepositoryPort;
  menus: MenuRepositoryPort;
  categories: CategoryRepositoryPort;
  products: ProductRepositoryPort;
  auditLogs: AuditLogRepositoryPort;
  sessions: SessionVerificationPort;
  demoAccessToken: string;
}

// Fixed, deterministic ids for the seeded demo data — required so seeding
// is idempotent against a real database (findById first, create only if
// missing) instead of minting a fresh Tenant on every process boot.
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_BRANCH_ID = "00000000-0000-0000-0000-000000000003";
const DEMO_SALON_ID = "00000000-0000-0000-0000-000000000004";
const DEMO_TABLE_ID = "00000000-0000-0000-0000-000000000005";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000006";
const DEMO_MEMBERSHIP_ID = "00000000-0000-0000-0000-000000000007";
const DEMO_SUBSCRIPTION_ID = "00000000-0000-0000-0000-000000000008";
const DEMO_MENU_ID = "00000000-0000-0000-0000-000000000009";
const DEMO_CATEGORY_ID = "00000000-0000-0000-0000-00000000000a";
const DEMO_PRODUCT_ID = "00000000-0000-0000-0000-00000000000b";
const DEMO_ACCESS_TOKEN = "demo-token";

interface Repositories {
  tenants: TenantRepositoryPort;
  branches: BranchRepositoryPort;
  brands: BrandRepositoryPort;
  fiscalEntities: FiscalEntityRepositoryPort;
  salons: SalonRepositoryPort;
  tables: TableRepositoryPort;
  users: UserRepositoryPort;
  memberships: MembershipRepositoryPort;
  outbox: OutboxPort;
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  quotas: QuotaRepositoryPort;
  menus: MenuRepositoryPort;
  categories: CategoryRepositoryPort;
  products: ProductRepositoryPort;
  auditLogs: AuditLogRepositoryPort;
}

/**
 * SPEC-210 — PERSISTENCE_DRIVER selects the adapter set. "memory" (default)
 * is the in-process fixture used by tests and local dev without Supabase
 * credentials. "supabase" talks to real Postgres via PostgREST using the
 * service role secret key (see adapters/persistence/supabase).
 */
function buildRepositories(): Repositories {
  const driver = process.env["PERSISTENCE_DRIVER"] ?? "memory";

  if (driver === "supabase") {
    const client = createSupabaseClient();
    return {
      tenants: new SupabaseTenantRepository(client),
      branches: new SupabaseBranchRepository(client),
      brands: new SupabaseBrandRepository(client),
      fiscalEntities: new SupabaseFiscalEntityRepository(client),
      salons: new SupabaseSalonRepository(client),
      tables: new SupabaseTableRepository(client),
      users: new SupabaseUserRepository(client),
      memberships: new SupabaseMembershipRepository(client),
      outbox: new SupabaseOutboxRepository(client),
      subscriptions: new SupabaseSubscriptionRepository(client),
      subscriptionItems: new SupabaseSubscriptionItemRepository(client),
      entitlements: new SupabaseEntitlementRepository(client),
      quotas: new SupabaseQuotaRepository(client),
      menus: new SupabaseMenuRepository(client),
      categories: new SupabaseCategoryRepository(client),
      products: new SupabaseProductRepository(client),
      auditLogs: new SupabaseAuditLogRepository(client),
    };
  }

  return {
    tenants: new InMemoryTenantRepository(),
    branches: new InMemoryBranchRepository(),
    brands: new InMemoryBrandRepository(),
    fiscalEntities: new InMemoryFiscalEntityRepository(),
    salons: new InMemorySalonRepository(),
    tables: new InMemoryTableRepository(),
    users: new InMemoryUserRepository(),
    memberships: new InMemoryMembershipRepository(),
    outbox: new InMemoryOutboxRepository(),
    subscriptions: new InMemorySubscriptionRepository(),
    subscriptionItems: new InMemorySubscriptionItemRepository(),
    entitlements: new InMemoryEntitlementRepository(),
    quotas: new InMemoryQuotaRepository(),
    menus: new InMemoryMenuRepository(),
    categories: new InMemoryCategoryRepository(),
    products: new InMemoryProductRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
  };
}

/**
 * Idempotent demo seed: checks for the fixed-id Tenant first and reuses
 * everything found, so restarting against a real database doesn't mint a
 * new "Maitre Demo Tenant" on every boot. Data is synthetic only, per
 * SPEC-213 "no objetivo: usar datos productivos".
 */
// Each step checks its own existence first — a boot that gets interrupted
// mid-seed (or a prior partial failure) must not leave later steps
// permanently skipped just because the Tenant already exists.
async function ensureSeed(repos: Repositories): Promise<void> {
  const now = new Date();

  let tenant = await repos.tenants.findById(DEMO_TENANT_ID);
  if (!tenant) {
    tenant = await createTenant(
      { tenants: repos.tenants, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_TENANT_ID,
        name: "Maitre Demo Tenant",
        defaultLocale: "es-AR",
        defaultCurrency: "ARS",
        defaultTimezone: "America/Argentina/Buenos_Aires",
      },
    );
  }

  let brand = await repos.brands.findById(tenant.id, DEMO_BRAND_ID);
  if (!brand) {
    brand = await createBrand(
      { tenants: repos.tenants, brands: repos.brands, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_BRAND_ID,
        tenantId: tenant.id,
        name: "Maitre Demo Brand",
        config: { language: "es", currency: tenant.defaultCurrency },
      },
    );
  }

  let branch = await repos.branches.findById(tenant.id, DEMO_BRANCH_ID);
  if (!branch) {
    branch = await createBranch(
      { brands: repos.brands, branches: repos.branches, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_BRANCH_ID,
        tenantId: tenant.id,
        brandId: brand.id,
        name: "Sucursal Principal",
        code: "MAIN",
        timezone: tenant.defaultTimezone,
      },
    );
  }

  let salon = await repos.salons.findById(tenant.id, DEMO_SALON_ID);
  if (!salon) {
    salon = await createSalon(
      { branches: repos.branches, salons: repos.salons, now: () => now },
      {
        id: DEMO_SALON_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        name: "Salón Principal",
        capacity: 40,
      },
    );
  }

  const table = await repos.tables.findById(tenant.id, DEMO_TABLE_ID);
  if (!table) {
    await createTable(
      { salons: repos.salons, tables: repos.tables, now: () => now },
      {
        id: DEMO_TABLE_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        salonId: salon.id,
        number: "1",
        capacity: 4,
      },
    );
  }

  const user = await repos.users.findById(DEMO_USER_ID);
  if (!user) {
    await repos.users.save({
      id: DEMO_USER_ID,
      identityProvider: "fixture",
      externalIdentityId: "demo-owner",
      displayName: "Demo Owner",
      email: "owner@demo.maitre",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    });
  }

  const membership = await repos.memberships.findActiveByUserAndTenant(
    DEMO_USER_ID,
    tenant.id,
  );
  if (!membership) {
    await createMembership(
      { memberships: repos.memberships, now: () => now },
      {
        id: DEMO_MEMBERSHIP_ID,
        tenantId: tenant.id,
        userId: DEMO_USER_ID,
        roleIds: ["role_owner"],
        branchScopeType: "ALL_BRANCHES",
      },
    );
  }

  const subscription = await repos.subscriptions.findById(DEMO_SUBSCRIPTION_ID);
  if (!subscription) {
    await createSubscription(
      {
        subscriptions: repos.subscriptions,
        subscriptionItems: repos.subscriptionItems,
        entitlements: repos.entitlements,
        now: () => now,
      },
      { id: DEMO_SUBSCRIPTION_ID, tenantId: tenant.id, planCode: "PROFESSIONAL" },
    );
  }

  let menu = await repos.menus.findById(tenant.id, DEMO_MENU_ID);
  if (!menu) {
    menu = await createMenu(
      { menus: repos.menus, now: () => now },
      { id: DEMO_MENU_ID, tenantId: tenant.id, brandId: brand.id, name: "Menú Principal", isDefault: true },
    );
  }

  let category = await repos.categories.findById(tenant.id, DEMO_CATEGORY_ID);
  if (!category) {
    category = await createCategory(
      { menus: repos.menus, categories: repos.categories, now: () => now },
      { id: DEMO_CATEGORY_ID, tenantId: tenant.id, menuId: menu.id, name: "Entradas" },
    );
  }

  const product = await repos.products.findById(tenant.id, DEMO_PRODUCT_ID);
  if (!product) {
    await createProduct(
      { categories: repos.categories, products: repos.products, now: () => now },
      {
        id: DEMO_PRODUCT_ID,
        tenantId: tenant.id,
        categoryId: category.id,
        name: "Empanadas de Carne",
        priceMinorUnits: 350000,
        currency: tenant.defaultCurrency,
      },
    );
  }
}

/**
 * SPEC-023 — AUTH_DRIVER selects how bearer tokens are verified. "fixture"
 * (default) accepts only tokens registered via registerToken(), used by
 * tests and local dev. "supabase" verifies real Supabase Auth access
 * tokens against the project's JWKS (SupabaseSessionVerificationPort) —
 * no synthetic demoAccessToken exists in that mode; callers must obtain a
 * real token via Supabase Auth (e.g. POST /auth/v1/token?grant_type=password).
 */
function buildSessionVerifier(): SessionVerificationPort {
  const driver = process.env["AUTH_DRIVER"] ?? "fixture";
  if (driver === "supabase") {
    const url = process.env["SUPABASE_URL"];
    if (!url) throw new Error("SUPABASE_URL must be set for AUTH_DRIVER=supabase");
    return new SupabaseSessionVerificationPort(url);
  }
  return new FixtureSessionVerificationPort();
}

export async function buildContainer(): Promise<Container> {
  const repos = buildRepositories();
  await ensureSeed(repos);

  const sessions = buildSessionVerifier();
  if (sessions instanceof FixtureSessionVerificationPort) {
    const now = new Date();
    sessions.registerToken(DEMO_ACCESS_TOKEN, {
      provider: "fixture",
      subject: "demo-owner",
      email: "owner@demo.maitre",
      emailVerified: true,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
  }

  return { ...repos, sessions, demoAccessToken: DEMO_ACCESS_TOKEN };
}
