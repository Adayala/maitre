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
  InMemoryVisitRepository,
  InMemoryOccupancyRepository,
  InMemoryCheckRepository,
  InMemoryPaymentRepository,
  InMemoryServicePeriodRepository,
  InMemoryReservationRepository,
  InMemoryGuestRepository,
  InMemoryWaitlistEntryRepository,
  InMemoryReservationPreferenceRepository,
  InMemoryCancellationPolicyRepository,
  InMemoryNotificationIntentRepository,
  InMemoryOrderRepository,
  InMemoryCapabilityTokenRepository,
  InMemorySpecialRequestRepository,
  InMemoryStationRepository,
  InMemoryCommandRepository,
  InMemoryKitchenAlertRepository,
  InMemoryCashRegisterRepository,
  InMemoryCashSessionRepository,
  InMemoryCashMovementRepository,
  InMemoryCashReconciliationRepository,
  InMemoryDiscountRepository,
  InMemoryDiscountApplicationRepository,
  InMemoryInvoiceRepository,
  InMemoryFiscalPointOfSaleRepository,
  InMemoryFiscalPrinterRepository,
  InMemoryFiscalCertificateRepository,
  InMemoryInvoiceTemplateRepository,
  InMemoryTaxRateRepository,
  InMemoryCatalogItemRepository,
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
  SupabaseVisitRepository,
  SupabaseOccupancyRepository,
  SupabaseCheckRepository,
  SupabasePaymentRepository,
  SupabaseServicePeriodRepository,
  SupabaseReservationRepository,
  SupabaseGuestRepository,
  SupabaseWaitlistEntryRepository,
  SupabaseReservationPreferenceRepository,
  SupabaseCancellationPolicyRepository,
  SupabaseNotificationIntentRepository,
  SupabaseOrderRepository,
  SupabaseCapabilityTokenRepository,
  SupabaseSpecialRequestRepository,
  SupabaseStationRepository,
  SupabaseCommandRepository,
  SupabaseKitchenAlertRepository,
  SupabaseEmploymentRepository,
  SupabaseWorkShiftRepository,
  SupabaseShiftAssignmentRepository,
  SupabaseTimeEntryRepository,
  SupabaseTimeAdjustmentRepository,
  SupabaseBreakLogRepository,
  SupabaseBreakAdjustmentRepository,
  SupabaseCashRegisterRepository,
  SupabaseCashSessionRepository,
  SupabaseCashMovementRepository,
  SupabaseCashReconciliationRepository,
  SupabaseDiscountRepository,
  SupabaseDiscountApplicationRepository,
  SupabaseInvoiceRepository,
  SupabaseFiscalPointOfSaleRepository,
  SupabaseFiscalPrinterRepository,
  SupabaseFiscalCertificateRepository,
  SupabaseInvoiceTemplateRepository,
  SupabaseTaxRateRepository,
  SupabaseCatalogItemRepository,
} from "@maitre/adapter-persistence-supabase";
import {
  createTenant,
  createBrand,
  createBranch,
  createSalon,
  createTable,
  createFiscalEntity,
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
  addService,
  addQuantityItem,
  type CatalogItem,
  type SubscriptionRepositoryPort,
  type SubscriptionItemRepositoryPort,
  type EntitlementRepositoryPort,
  type QuotaRepositoryPort,
  type CatalogRepositoryPort,
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
import type {
  VisitRepositoryPort,
  OccupancyRepositoryPort,
  CheckRepositoryPort,
  PaymentRepositoryPort,
  ServicePeriodRepositoryPort,
} from "@maitre/floor";
import {
  deriveBusinessDate,
  openVisit,
  createCheck,
  addCheckLine,
} from "@maitre/floor";
import type {
  ReservationRepositoryPort,
  GuestRepositoryPort,
  WaitlistEntryRepositoryPort,
  ReservationPreferenceRepositoryPort,
  CancellationPolicyRepositoryPort,
  NotificationIntentRepositoryPort,
} from "@maitre/reservations";
import {
  createGuest,
  createReservation,
  confirmReservation,
  addWaitlistEntry,
} from "@maitre/reservations";
import {
  hashToken,
  type OrderRepositoryPort,
  type CapabilityTokenRepositoryPort,
  type SpecialRequestRepositoryPort,
  createOrder,
  addOrderItem,
  submitOrder,
} from "@maitre/ordering";
import {
  createStation,
  createCommand,
  type StationRepositoryPort,
  type CommandRepositoryPort,
  type KitchenAlertRepositoryPort,
} from "@maitre/kitchen";
import {
  createCashRegister,
  openSession,
  recordMovement,
  type CashRegisterRepositoryPort,
  type CashSessionRepositoryPort,
  type CashMovementRepositoryPort,
  type CashReconciliationRepositoryPort,
  type DiscountRepositoryPort,
  type DiscountApplicationRepositoryPort,
} from "@maitre/cash";
import {
  SimulatedArcaAdapter,
  createPointOfSale,
  createTaxRate,
  publishTaxRate,
  type InvoiceRepositoryPort,
  type FiscalPointOfSaleRepositoryPort,
  type FiscalPrinterRepositoryPort,
  type FiscalCertificateRepositoryPort,
  type InvoiceTemplateRepositoryPort,
  type TaxRateRepositoryPort,
  type ArcaAdapterPort,
} from "@maitre/fiscal";
import type {
  EmploymentRepositoryPort,
  WorkShiftRepositoryPort,
  ShiftAssignmentRepositoryPort,
  TimeEntryRepositoryPort,
  TimeAdjustmentRepositoryPort,
  BreakLogRepositoryPort,
  BreakAdjustmentRepositoryPort,
} from "@maitre/workforce";
import type { LaborPolicyVersionRepositoryPort } from "../workforce/labor-policy-repository.js";
import { InMemoryLaborPolicyVersionRepository } from "../workforce/labor-policy-repository.js";
import { SupabaseLaborPolicyVersionRepository } from "../workforce/supabase-labor-policy-repository.js";
import type { TimeExportJobRepositoryPort } from "../workforce/time-export-repository.js";
import { InMemoryTimeExportJobRepository } from "../workforce/time-export-repository.js";
import { SupabaseTimeExportJobRepository } from "../workforce/supabase-time-export-repository.js";

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
  catalog: CatalogRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  quotas: QuotaRepositoryPort;
  menus: MenuRepositoryPort;
  categories: CategoryRepositoryPort;
  products: ProductRepositoryPort;
  auditLogs: AuditLogRepositoryPort;
  visits: VisitRepositoryPort;
  occupancies: OccupancyRepositoryPort;
  checks: CheckRepositoryPort;
  payments: PaymentRepositoryPort;
  servicePeriods: ServicePeriodRepositoryPort;
  reservations: ReservationRepositoryPort;
  guests: GuestRepositoryPort;
  waitlistEntries: WaitlistEntryRepositoryPort;
  reservationPreferences: ReservationPreferenceRepositoryPort;
  cancellationPolicies: CancellationPolicyRepositoryPort;
  notificationIntents: NotificationIntentRepositoryPort;
  orders: OrderRepositoryPort;
  capabilityTokens: CapabilityTokenRepositoryPort;
  specialRequests: SpecialRequestRepositoryPort;
  stations: StationRepositoryPort;
  commands: CommandRepositoryPort;
  kitchenAlerts: KitchenAlertRepositoryPort;
  cashRegisters: CashRegisterRepositoryPort;
  cashSessions: CashSessionRepositoryPort;
  cashMovements: CashMovementRepositoryPort;
  cashReconciliations: CashReconciliationRepositoryPort;
  discounts: DiscountRepositoryPort;
  discountApplications: DiscountApplicationRepositoryPort;
  invoices: InvoiceRepositoryPort;
  fiscalPointsOfSale: FiscalPointOfSaleRepositoryPort;
  fiscalPrinters: FiscalPrinterRepositoryPort;
  fiscalCertificates: FiscalCertificateRepositoryPort;
  invoiceTemplates: InvoiceTemplateRepositoryPort;
  taxRates: TaxRateRepositoryPort;
  arca: ArcaAdapterPort;
  employments?: EmploymentRepositoryPort;
  workShifts?: WorkShiftRepositoryPort;
  shiftAssignments?: ShiftAssignmentRepositoryPort;
  timeEntries?: TimeEntryRepositoryPort;
  timeAdjustments?: TimeAdjustmentRepositoryPort;
  breakLogs?: BreakLogRepositoryPort;
  breakAdjustments?: BreakAdjustmentRepositoryPort;
  laborPolicyVersions?: LaborPolicyVersionRepositoryPort;
  timeExportJobs?: TimeExportJobRepositoryPort;
  now?: () => Date;
  sessions: SessionVerificationPort;
  demoAccessToken: string;
  demoQrMenuToken: string;
}

// Fixed, deterministic ids for the seeded demo data — required so seeding
// is idempotent against a real database (findById first, create only if
// missing) instead of minting a fresh Tenant on every process boot.
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_BRAND_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_BRANCH_ID = "00000000-0000-0000-0000-000000000003";
const DEMO_SALON_ID = "00000000-0000-0000-0000-000000000004";
const DEMO_TABLE_ID = "00000000-0000-0000-0000-000000000005";
const DEMO_TABLE_2_ID = "00000000-0000-0000-0000-000000000011";
const DEMO_TABLE_3_ID = "00000000-0000-0000-0000-000000000012";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000006";
const DEMO_MEMBERSHIP_ID = "00000000-0000-0000-0000-000000000007";
const DEMO_SUBSCRIPTION_ID = "00000000-0000-0000-0000-000000000008";
const DEMO_MENU_ID = "00000000-0000-0000-0000-000000000009";
const DEMO_CATEGORY_ID = "00000000-0000-0000-0000-00000000000a";
const DEMO_PRODUCT_ID = "00000000-0000-0000-0000-00000000000b";
const DEMO_ACCESS_TOKEN = "demo-token";

const catalogItem = (
  code: string,
  name: string,
  billingType: CatalogItem["billingType"],
  billingScope: CatalogItem["billingScope"],
  unitPrice: number,
  dependsOn: string[] = [],
): CatalogItem => ({
  code,
  name,
  billingType,
  billingScope,
  unitPrice,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn,
  isActive: true,
  version: 1,
});

const SEED_CATALOG_ITEMS: CatalogItem[] = [
  catalogItem("CORE", "Maitre Core", "SERVICE", "TENANT", 15_000),
  catalogItem("BRANCHES", "Maitre Branches", "QUANTITY", "TENANT", 8_000, ["CORE"]),
  catalogItem("IDENTITY", "Maitre Identity", "SERVICE", "TENANT", 0, ["CORE"]),
  catalogItem("CONNECT", "Maitre Connect", "SERVICE", "BRANCH", 3_000, ["CORE"]),
  catalogItem("FLOOR", "Maitre Floor", "SERVICE", "BRANCH", 6_000, ["CORE", "BRANCHES"]),
  catalogItem("SEATS", "Plazas", "QUANTITY", "BRANCH", 500, ["FLOOR"]),
  catalogItem("RESERVATIONS", "Maitre Reservations", "SERVICE", "BRANCH", 4_000, ["CORE", "BRANCHES"]),
  catalogItem("SHIFTS", "Maitre Shifts", "SERVICE", "BRANCH", 3_000, ["CORE", "BRANCHES"]),
  catalogItem("SHIFT_SLOTS", "Turnos", "QUANTITY", "BRANCH", 300, ["SHIFTS"]),
  catalogItem("WAITERS", "Mozos", "QUANTITY", "BRANCH", 1_200, ["FLOOR"]),
  catalogItem("CASHIERS", "Cajeros", "QUANTITY", "BRANCH", 1_500, ["CASH"]),
  catalogItem("KITCHEN", "Maitre Kitchen", "SERVICE", "BRANCH", 5_000, ["FLOOR"]),
  catalogItem("QR_MENU", "Maitre QR Menu", "SERVICE", "BRANCH", 2_000, ["CORE"]),
  catalogItem("QR_ORDERING", "Maitre QR Ordering", "SERVICE", "BRANCH", 3_000, ["QR_MENU"]),
  catalogItem("GUEST", "Maitre Guest", "SERVICE", "BRANCH", 2_000, ["CORE"]),
  catalogItem("DELIVERY", "Maitre Delivery", "SERVICE", "BRANCH", 4_000, ["CORE"]),
  catalogItem("INVENTORY", "Maitre Inventory", "SERVICE", "BRANCH", 5_000, ["CORE"]),
  catalogItem("CASH", "Maitre Cash", "SERVICE", "BRANCH", 3_500, ["CORE"]),
  catalogItem("BILLING", "Maitre Billing", "SERVICE", "FISCAL_ENTITY", 5_000, ["CORE"]),
  catalogItem("PAYMENTS", "Maitre Payments", "SERVICE", "TENANT", 4_000, ["CASH"]),
  catalogItem("PAYLANDING", "Maitre PayLanding", "SERVICE", "TENANT", 3_000, ["PAYMENTS"]),
  catalogItem("PAYLANDING.MERCADOPAGO", "PayLanding — Mercado Pago", "SERVICE", "CONNECTOR", 0, ["PAYLANDING"]),
  catalogItem("PAYLANDING.NARANJA_X", "PayLanding — Naranja X", "SERVICE", "CONNECTOR", 0, ["PAYLANDING"]),
  catalogItem("PAYLANDING.MODO", "PayLanding — MODO", "SERVICE", "CONNECTOR", 0, ["PAYLANDING"]),
  catalogItem("PAYLANDING.TODO_PAGO", "PayLanding — Todo Pago", "SERVICE", "CONNECTOR", 0, ["PAYLANDING"]),
  catalogItem("ARCA", "Maitre ARCA", "SERVICE", "FISCAL_ENTITY", 7_000, ["BILLING"]),
  catalogItem("IVA", "Maitre IVA", "SERVICE", "FISCAL_ENTITY", 4_000, ["BILLING"]),
  catalogItem("FEEDBACK", "Maitre Feedback", "SERVICE", "BRANCH", 2_500, ["CORE"]),
  catalogItem("REPUTATION", "Maitre Reputation", "SERVICE", "BRANCH", 3_500, ["CORE"]),
  catalogItem("CRM", "Maitre CRM", "SERVICE", "BRAND", 4_500, ["CORE"]),
  catalogItem("LOYALTY", "Maitre Loyalty", "SERVICE", "BRAND", 4_000, ["CRM"]),
  catalogItem("AI_ASSISTANT", "Maitre AI Assistant", "SERVICE", "TENANT", 8_000, ["CORE"]),
  catalogItem("AI_FORECAST", "Maitre AI Forecast", "SERVICE", "BRANCH", 7_000, ["CORE"]),
  catalogItem("AI_PROMISE", "Maitre AI Promise", "SERVICE", "BRANCH", 7_000, ["RESERVATIONS"]),
  catalogItem("AI_KITCHEN", "Maitre AI Kitchen", "SERVICE", "BRANCH", 7_000, ["KITCHEN"]),
  catalogItem("AI_AHEAD", "Maitre Ahead", "SERVICE", "BRANCH", 10_000, ["FLOOR", "RESERVATIONS", "KITCHEN"]),
  catalogItem("AI_AUTOPILOT", "Maitre Autopilot", "SERVICE", "BRANCH", 12_000, ["AI_AHEAD"]),
];
// Demo public MENU_READ capability for manual QR-menu curl testing against the
// seeded demo Menu. Only its SHA-256 hash is stored (hash-at-rest); the raw
// token below is the value a client presents to GET /public/menu/:token. Fixed
// id keeps the seed idempotent across boots. Synthetic testing data only.
const DEMO_QR_MENU_TOKEN = "demo-qr-menu-token";
const DEMO_QR_TOKEN_ID = "00000000-0000-0000-0000-00000000000c";
// Kitchen (SPEC-099/110): one default demo Station so Ordering's submit-order has
// somewhere to route the Commands it creates. Fixed id keeps the seed idempotent.
const DEMO_STATION_ID = "00000000-0000-0000-0000-00000000000d";
// Cash (SPEC-124/128): one demo CashRegister for the demo Branch, so a session
// can be opened for manual testing. Fixed id keeps the seed idempotent. Sessions
// / movements / reconciliations are transactional (operational data), not seeded.
const DEMO_CASH_REGISTER_ID = "00000000-0000-0000-0000-00000000000e";
// Fiscal (SPEC-137..156): a demo FiscalEntity (legal/tax entity — Organization
// SPEC-003/009), one demo FiscalPointOfSale and one PUBLISHED demo TaxRate so an
// Invoice can be created + issued by hand. Invoices/notes are transactional, not
// seeded. The FiscalEntity id is minted by createFiscalEntity, so it is looked up
// by CUIT (idempotent) rather than by a fixed id.
const DEMO_FISCAL_ENTITY_CUIT = "20123456786";
const DEMO_FISCAL_POS_ID = "00000000-0000-0000-0000-00000000000f";
const DEMO_TAX_RATE_ID = "00000000-0000-0000-0000-000000000010";
const DEMO_SERVICE_PERIOD_ID = "00000000-0000-0000-0000-000000000013";
const DEMO_GUEST_ID = "00000000-0000-0000-0000-000000000014";
const DEMO_RESERVATION_ID = "00000000-0000-0000-0000-000000000015";
const DEMO_WAITLIST_ID = "00000000-0000-0000-0000-000000000016";
const DEMO_VISIT_ID = "00000000-0000-0000-0000-000000000017";
const DEMO_ORDER_ID = "00000000-0000-0000-0000-000000000018";
const DEMO_COMMAND_ID = "00000000-0000-0000-0000-000000000019";
const DEMO_CASH_SESSION_ID = "00000000-0000-0000-0000-00000000001a";
const DEMO_CASH_SALE_SOURCE_REF = "seed-cash-sale-1";
const DEMO_CASH_WITHDRAWAL_SOURCE_REF = "seed-cash-withdrawal-1";

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
  catalog: CatalogRepositoryPort;
  entitlements: EntitlementRepositoryPort;
  quotas: QuotaRepositoryPort;
  menus: MenuRepositoryPort;
  categories: CategoryRepositoryPort;
  products: ProductRepositoryPort;
  auditLogs: AuditLogRepositoryPort;
  visits: VisitRepositoryPort;
  occupancies: OccupancyRepositoryPort;
  checks: CheckRepositoryPort;
  payments: PaymentRepositoryPort;
  servicePeriods: ServicePeriodRepositoryPort;
  reservations: ReservationRepositoryPort;
  guests: GuestRepositoryPort;
  waitlistEntries: WaitlistEntryRepositoryPort;
  reservationPreferences: ReservationPreferenceRepositoryPort;
  cancellationPolicies: CancellationPolicyRepositoryPort;
  notificationIntents: NotificationIntentRepositoryPort;
  orders: OrderRepositoryPort;
  capabilityTokens: CapabilityTokenRepositoryPort;
  specialRequests: SpecialRequestRepositoryPort;
  stations: StationRepositoryPort;
  commands: CommandRepositoryPort;
  kitchenAlerts: KitchenAlertRepositoryPort;
  cashRegisters: CashRegisterRepositoryPort;
  cashSessions: CashSessionRepositoryPort;
  cashMovements: CashMovementRepositoryPort;
  cashReconciliations: CashReconciliationRepositoryPort;
  discounts: DiscountRepositoryPort;
  discountApplications: DiscountApplicationRepositoryPort;
  invoices: InvoiceRepositoryPort;
  fiscalPointsOfSale: FiscalPointOfSaleRepositoryPort;
  fiscalPrinters: FiscalPrinterRepositoryPort;
  fiscalCertificates: FiscalCertificateRepositoryPort;
  invoiceTemplates: InvoiceTemplateRepositoryPort;
  taxRates: TaxRateRepositoryPort;
  employments?: EmploymentRepositoryPort;
  workShifts?: WorkShiftRepositoryPort;
  shiftAssignments?: ShiftAssignmentRepositoryPort;
  timeEntries?: TimeEntryRepositoryPort;
  timeAdjustments?: TimeAdjustmentRepositoryPort;
  breakLogs?: BreakLogRepositoryPort;
  breakAdjustments?: BreakAdjustmentRepositoryPort;
  laborPolicyVersions?: LaborPolicyVersionRepositoryPort;
  timeExportJobs?: TimeExportJobRepositoryPort;
}

function hasSupabasePersistenceConfig(): boolean {
  return Boolean(
    process.env["SUPABASE_URL"] &&
      (process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"]),
  );
}

function hasSupabaseAuthConfig(): boolean {
  return Boolean(process.env["SUPABASE_URL"]);
}

/**
 * SPEC-210 — PERSISTENCE_DRIVER selects the adapter set. When the variable is
 * omitted, the API now auto-selects "supabase" if the required Supabase
 * server-side secret credentials are present; otherwise it falls back to
 * "memory".
 * "memory" remains the in-process fixture used by tests and local dev without
 * Supabase credentials. "supabase" talks to real Postgres via PostgREST using
 * the configured server-side secret key (see adapters/persistence/supabase).
 */
function buildRepositories(): Repositories {
  const driver =
    process.env["PERSISTENCE_DRIVER"] ?? (hasSupabasePersistenceConfig() ? "supabase" : "memory");

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
      catalog: new SupabaseCatalogItemRepository(client),
      entitlements: new SupabaseEntitlementRepository(client),
      quotas: new SupabaseQuotaRepository(client),
      menus: new SupabaseMenuRepository(client),
      categories: new SupabaseCategoryRepository(client),
      products: new SupabaseProductRepository(client),
      auditLogs: new SupabaseAuditLogRepository(client),
      visits: new SupabaseVisitRepository(client),
      occupancies: new SupabaseOccupancyRepository(client),
      checks: new SupabaseCheckRepository(client),
      payments: new SupabasePaymentRepository(client),
      servicePeriods: new SupabaseServicePeriodRepository(client),
      reservations: new SupabaseReservationRepository(client),
      guests: new SupabaseGuestRepository(client),
      waitlistEntries: new SupabaseWaitlistEntryRepository(client),
      reservationPreferences: new SupabaseReservationPreferenceRepository(client),
      cancellationPolicies: new SupabaseCancellationPolicyRepository(client),
      notificationIntents: new SupabaseNotificationIntentRepository(client),
      orders: new SupabaseOrderRepository(client),
      capabilityTokens: new SupabaseCapabilityTokenRepository(client),
      specialRequests: new SupabaseSpecialRequestRepository(client),
      stations: new SupabaseStationRepository(client),
      commands: new SupabaseCommandRepository(client),
      kitchenAlerts: new SupabaseKitchenAlertRepository(client),
      cashRegisters: new SupabaseCashRegisterRepository(client),
      cashSessions: new SupabaseCashSessionRepository(client),
      cashMovements: new SupabaseCashMovementRepository(client),
      cashReconciliations: new SupabaseCashReconciliationRepository(client),
      discounts: new SupabaseDiscountRepository(client),
      discountApplications: new SupabaseDiscountApplicationRepository(client),
      invoices: new SupabaseInvoiceRepository(client),
      fiscalPointsOfSale: new SupabaseFiscalPointOfSaleRepository(client),
      fiscalPrinters: new SupabaseFiscalPrinterRepository(client),
      fiscalCertificates: new SupabaseFiscalCertificateRepository(client),
      invoiceTemplates: new SupabaseInvoiceTemplateRepository(client),
      taxRates: new SupabaseTaxRateRepository(client),
      employments: new SupabaseEmploymentRepository(client),
      workShifts: new SupabaseWorkShiftRepository(client),
      shiftAssignments: new SupabaseShiftAssignmentRepository(client),
      timeEntries: new SupabaseTimeEntryRepository(client),
      timeAdjustments: new SupabaseTimeAdjustmentRepository(client),
      breakLogs: new SupabaseBreakLogRepository(client),
      breakAdjustments: new SupabaseBreakAdjustmentRepository(client),
      laborPolicyVersions: new SupabaseLaborPolicyVersionRepository(client),
      timeExportJobs: new SupabaseTimeExportJobRepository(client),
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
    // seed real llega en la Task 8 (SEED_CATALOG_ITEMS)
    catalog: new InMemoryCatalogItemRepository(SEED_CATALOG_ITEMS),
    entitlements: new InMemoryEntitlementRepository(),
    quotas: new InMemoryQuotaRepository(),
    menus: new InMemoryMenuRepository(),
    categories: new InMemoryCategoryRepository(),
    products: new InMemoryProductRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
    visits: new InMemoryVisitRepository(),
    occupancies: new InMemoryOccupancyRepository(),
    checks: new InMemoryCheckRepository(),
    payments: new InMemoryPaymentRepository(),
    servicePeriods: new InMemoryServicePeriodRepository(),
    reservations: new InMemoryReservationRepository(),
    guests: new InMemoryGuestRepository(),
    waitlistEntries: new InMemoryWaitlistEntryRepository(),
    reservationPreferences: new InMemoryReservationPreferenceRepository(),
    cancellationPolicies: new InMemoryCancellationPolicyRepository(),
    notificationIntents: new InMemoryNotificationIntentRepository(),
    orders: new InMemoryOrderRepository(),
    capabilityTokens: new InMemoryCapabilityTokenRepository(),
    specialRequests: new InMemorySpecialRequestRepository(),
    stations: new InMemoryStationRepository(),
    commands: new InMemoryCommandRepository(),
    kitchenAlerts: new InMemoryKitchenAlertRepository(),
    cashRegisters: new InMemoryCashRegisterRepository(),
    cashSessions: new InMemoryCashSessionRepository(),
    cashMovements: new InMemoryCashMovementRepository(),
    cashReconciliations: new InMemoryCashReconciliationRepository(),
    discounts: new InMemoryDiscountRepository(),
    discountApplications: new InMemoryDiscountApplicationRepository(),
    invoices: new InMemoryInvoiceRepository(),
    fiscalPointsOfSale: new InMemoryFiscalPointOfSaleRepository(),
    fiscalPrinters: new InMemoryFiscalPrinterRepository(),
    fiscalCertificates: new InMemoryFiscalCertificateRepository(),
    invoiceTemplates: new InMemoryInvoiceTemplateRepository(),
    taxRates: new InMemoryTaxRateRepository(),
    laborPolicyVersions: new InMemoryLaborPolicyVersionRepository(),
    timeExportJobs: new InMemoryTimeExportJobRepository(),
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
  const persistenceDriver =
    process.env["PERSISTENCE_DRIVER"] ?? (hasSupabasePersistenceConfig() ? "supabase" : "memory");
  const seedOperationalDemo = persistenceDriver === "supabase";

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

  const table2 = await repos.tables.findById(tenant.id, DEMO_TABLE_2_ID);
  if (!table2) {
    await createTable(
      { salons: repos.salons, tables: repos.tables, now: () => now },
      {
        id: DEMO_TABLE_2_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        salonId: salon.id,
        number: "2",
        capacity: 4,
      },
    );
  }

  const table3 = await repos.tables.findById(tenant.id, DEMO_TABLE_3_ID);
  if (!table3) {
    await createTable(
      { salons: repos.salons, tables: repos.tables, now: () => now },
      {
        id: DEMO_TABLE_3_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        salonId: salon.id,
        number: "3",
        capacity: 6,
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

  for (const item of SEED_CATALOG_ITEMS) {
    if (!(await repos.catalog.findByCode(item.code))) {
      await (repos.catalog as CatalogRepositoryPort & { save(item: CatalogItem): Promise<void> }).save(item);
    }
  }

  const subscription = await repos.subscriptions.findById(DEMO_SUBSCRIPTION_ID);
  if (!subscription) {
    await createSubscription(
      {
        subscriptions: repos.subscriptions,
        subscriptionItems: repos.subscriptionItems,
        entitlements: repos.entitlements,
        catalog: repos.catalog,
        now: () => now,
      },
      { id: DEMO_SUBSCRIPTION_ID, tenantId: tenant.id, planCode: "PROFESSIONAL" },
    );

    const itemDeps = {
      subscriptions: repos.subscriptions,
      subscriptionItems: repos.subscriptionItems,
      catalog: repos.catalog,
      entitlements: repos.entitlements,
      outbox: repos.outbox,
      now: () => now,
    };
    await addService(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      serviceId: "CORE",
    });
    await addQuantityItem(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      catalogItemCode: "BRANCHES",
      quantity: 1,
    });
    await addService(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      serviceId: "FLOOR",
      scopeRefId: DEMO_BRANCH_ID,
    });
    await addQuantityItem(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: DEMO_BRANCH_ID,
    });
    await addQuantityItem(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      catalogItemCode: "WAITERS",
      quantity: 8,
      scopeRefId: DEMO_BRANCH_ID,
    });
    await addQuantityItem(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      catalogItemCode: "CASHIERS",
      quantity: 3,
      scopeRefId: DEMO_BRANCH_ID,
    });
    await addService(itemDeps, {
      subscriptionId: DEMO_SUBSCRIPTION_ID,
      serviceId: "RESERVATIONS",
      scopeRefId: DEMO_BRANCH_ID,
    });
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

  // Ordering (SPEC-084/088): a demo MENU_READ capability token pointing at the
  // seeded demo Menu, so the public GET /public/menu/:token route can be
  // exercised by hand. Idempotent via the fixed token hash. This is the only
  // Ordering seed — Orders/KitchenTickets/etc. are transactional, not seeded.
  const existingQr = await repos.capabilityTokens.findByHash(hashToken(DEMO_QR_MENU_TOKEN));
  if (!existingQr) {
    await repos.capabilityTokens.save({
      id: DEMO_QR_TOKEN_ID,
      tenantId: tenant.id,
      purpose: "MENU_READ",
      tokenHash: hashToken(DEMO_QR_MENU_TOKEN),
      resourceType: "MENU",
      resourceId: DEMO_MENU_ID,
      branchId: branch.id,
      status: "ACTIVE",
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Kitchen (SPEC-099): one default ACTIVE demo Station for the demo Branch, so
  // Ordering's submit-order can route the Commands it creates to it. Idempotent
  // via the fixed id. Commands/Alerts are transactional, not seeded.
  const station = await repos.stations.findById(tenant.id, DEMO_STATION_ID);
  if (!station) {
    await createStation(
      { stations: repos.stations, now: () => now },
      {
        id: DEMO_STATION_ID,
        tenantId: tenant.id,
        brandId: brand.id,
        branchId: branch.id,
        code: "MAIN",
        displayName: "Cocina Principal",
        capabilities: ["HOT", "COLD"],
        displayOrder: 0,
      },
    );
  }

  // Cash (SPEC-124): one demo CashRegister for the demo Branch, accepting the
  // tenant's default currency, so a CashSession can be opened by hand. Idempotent
  // via the fixed id.
  const cashRegister = await repos.cashRegisters.findById(tenant.id, DEMO_CASH_REGISTER_ID);
  if (!cashRegister) {
    await createCashRegister(
      { registers: repos.cashRegisters, now: () => now },
      {
        id: DEMO_CASH_REGISTER_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        code: "CAJA-1",
        displayName: "Caja Principal",
        allowedCurrencies: [tenant.defaultCurrency],
      },
    );
  }

  // Fiscal (SPEC-137..156): optional demo seed. If the connected Supabase
  // project does not yet have the fiscal schema deployed, skip this block so
  // the rest of the app can still boot against real organization/floor/ordering
  // data while fiscal rollout catches up.
  try {
    let fiscalEntity = await repos.fiscalEntities.findByCuit(tenant.id, DEMO_FISCAL_ENTITY_CUIT);
    if (!fiscalEntity) {
      fiscalEntity = await createFiscalEntity(
        { tenants: repos.tenants, fiscalEntities: repos.fiscalEntities, outbox: repos.outbox, now: () => now },
        {
          tenantId: tenant.id,
          cuit: DEMO_FISCAL_ENTITY_CUIT,
          name: "Maitre Demo Fiscal Entity",
          taxCondition: "RI",
          createIdempotencyKey: "demo-fiscal-entity",
        },
      );
    }

    const demoPos = await repos.fiscalPointsOfSale.findById(tenant.id, DEMO_FISCAL_POS_ID);
    if (!demoPos) {
      await createPointOfSale(
        { pointsOfSale: repos.fiscalPointsOfSale, now: () => now },
        {
          id: DEMO_FISCAL_POS_ID,
          tenantId: tenant.id,
          fiscalEntityId: fiscalEntity.id,
          environment: "HOMOLOGATION",
          officialCode: "0001",
          allowedVoucherTypes: [
            "FACTURA_A",
            "FACTURA_B",
            "FACTURA_C",
            "NOTA_CREDITO_A",
            "NOTA_DEBITO_A",
          ],
        },
      );
    }

    const demoRate = await repos.taxRates.findById(DEMO_TAX_RATE_ID);
    if (!demoRate) {
      await createTaxRate(
        { taxRates: repos.taxRates, now: () => now },
        {
          id: DEMO_TAX_RATE_ID,
          jurisdiction: "AR",
          taxType: "IVA",
          officialCode: "5",
          treatment: "TAXED",
          decimalRate: 2100, // 21.00% in basis points
          includedInPrice: false,
          effectiveFrom: new Date("2020-01-01T00:00:00.000Z"),
          normativeSourceVersion: "AR-IVA-GENERAL",
        },
      );
      await publishTaxRate({ taxRates: repos.taxRates, now: () => now }, { id: DEMO_TAX_RATE_ID });
    }
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "PGRST205") {
      // eslint-disable-next-line no-console
      console.warn(
        `Fiscal Supabase schema missing or not exposed (${String("message" in err ? err.message : "unknown table")}); apply fiscal migrations before enabling fiscal runtime seed`,
      );
    } else {
      throw err;
    }
  }

  if (!seedOperationalDemo) return;

  const businessDate = deriveBusinessDate(now, tenant.defaultTimezone);

  let servicePeriod = await repos.servicePeriods.findById(tenant.id, DEMO_SERVICE_PERIOD_ID);
  if (!servicePeriod) {
    servicePeriod = {
      id: DEMO_SERVICE_PERIOD_ID,
      tenantId: tenant.id,
      branchId: branch.id,
      businessDate,
      name: "Servicio principal",
      type: "LUNCH" as const,
      plannedOpen: new Date(now.getTime() - 30 * 60_000),
      plannedClose: new Date(now.getTime() + 4 * 60 * 60_000),
      actualOpen: now,
      actualClose: null,
      status: "OPEN" as const,
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };
    await repos.servicePeriods.save(servicePeriod);
  }

  let guest = await repos.guests.findById(tenant.id, DEMO_GUEST_ID);
  if (!guest) {
    guest = await createGuest(
      { guests: repos.guests, now: () => now },
      {
        id: DEMO_GUEST_ID,
        tenantId: tenant.id,
        displayName: "Ana Demo",
        email: "ana.demo@maitre.local",
        phone: "+54 11 5555 0001",
        locale: "es-AR",
        consentGiven: true,
        notes: "Guest seeded for live demo flows",
      },
    );
  }

  let reservation = await repos.reservations.findById(tenant.id, DEMO_RESERVATION_ID);
  if (!reservation) {
    reservation = await createReservation(
      { reservations: repos.reservations, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_RESERVATION_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        guestId: guest.id,
        partySize: 2,
        startAt: new Date(now.getTime() + 2 * 60 * 60_000),
        durationMinutes: 90,
        source: "WEB_PORTAL",
        notes: "Reserva demo confirmada para validar host/customer",
      },
    );
  }
  if (reservation.status === "PENDING") {
    reservation = await confirmReservation(
      { reservations: repos.reservations, outbox: repos.outbox, now: () => now },
      {
        tenantId: tenant.id,
        reservationId: reservation.id,
        tables: [
          { id: DEMO_TABLE_2_ID, capacity: 4 },
          { id: DEMO_TABLE_ID, capacity: 4 },
          { id: DEMO_TABLE_3_ID, capacity: 6 },
        ],
      },
    );
  }

  const waitlist = await repos.waitlistEntries.findById(tenant.id, DEMO_WAITLIST_ID);
  if (!waitlist) {
    await addWaitlistEntry(
      { waitlistEntries: repos.waitlistEntries, now: () => now },
      {
        id: DEMO_WAITLIST_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        guestId: guest.id,
        partySize: 3,
        quotedMinutes: 20,
        notes: "Espera demo para validar host floor",
      },
    );
  }

  const visit = await repos.visits.findById(tenant.id, DEMO_VISIT_ID);
  if (!visit) {
    await openVisit(
      { visits: repos.visits, occupancies: repos.occupancies, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_VISIT_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        tableIds: [DEMO_TABLE_3_ID],
        guestCount: 2,
      },
    );
  }

  let check = await repos.checks.findByVisit(tenant.id, DEMO_VISIT_ID);
  if (!check) {
    check = await createCheck(
      { checks: repos.checks, visits: repos.visits, outbox: repos.outbox, now: () => now },
      { tenantId: tenant.id, visitId: DEMO_VISIT_ID, currency: tenant.defaultCurrency },
    );
  }

  let order = await repos.orders.findById(tenant.id, DEMO_ORDER_ID);
  if (!order) {
    order = await createOrder(
      { orders: repos.orders, now: () => now },
      {
        id: DEMO_ORDER_ID,
        tenantId: tenant.id,
        branchId: branch.id,
        visitId: DEMO_VISIT_ID,
        currency: tenant.defaultCurrency,
        notes: "Pedido demo enviado a cocina",
      },
    );
  }
  if (order.items.length === 0) {
    order = await addOrderItem(
      { orders: repos.orders, now: () => now },
      {
        tenantId: tenant.id,
        orderId: order.id,
        productId: DEMO_PRODUCT_ID,
        name: "Empanadas de Carne",
        quantity: 2,
        unitPriceMinorUnits: 350000,
        currency: tenant.defaultCurrency,
        allergens: ["GLUTEN"],
        notes: "Sin picante",
      },
    );
  }
  if (order.status === "DRAFT") {
    const result = await submitOrder(
      { orders: repos.orders, outbox: repos.outbox, now: () => now },
      { tenantId: tenant.id, orderId: order.id },
    );
    order = result.order;
  }

  check = (await repos.checks.findByVisit(tenant.id, DEMO_VISIT_ID)) ?? check;
  if (check && !check.lines.some((line) => line.description === `Order ${order.id}`)) {
    await addCheckLine(
      { checks: repos.checks, now: () => now },
      {
        tenantId: tenant.id,
        checkId: check.id,
        description: `Order ${order.id}`,
        amountMinorUnits: order.grandTotalMinorUnits,
      },
    );
  }

  const existingCommands = await repos.commands.listByOrder(tenant.id, DEMO_ORDER_ID);
  if (existingCommands.length === 0 && order.items.length > 0) {
    const item = order.items[0]!;
    await createCommand(
      { commands: repos.commands, outbox: repos.outbox, now: () => now },
      {
        id: DEMO_COMMAND_ID,
        tenantId: tenant.id,
        brandId: brand.id,
        branchId: branch.id,
        visitId: DEMO_VISIT_ID,
        orderId: order.id,
        orderItemId: item.id,
        stationId: DEMO_STATION_ID,
        payload: {
          displayName: item.name,
          quantity: item.quantity,
          allergenFlags: item.allergens,
          ...(item.notes ? { notes: item.notes } : {}),
        },
      },
    );
  }

  const liveSession =
    (await repos.cashSessions.findLiveByRegisterAndCurrency(
      tenant.id,
      DEMO_CASH_REGISTER_ID,
      tenant.defaultCurrency,
    )) ??
    (await openSession(
      { registers: repos.cashRegisters, sessions: repos.cashSessions, now: () => now },
      {
        id: DEMO_CASH_SESSION_ID,
        tenantId: tenant.id,
        cashRegisterId: DEMO_CASH_REGISTER_ID,
        currency: tenant.defaultCurrency,
        businessDate,
        timezone: tenant.defaultTimezone,
        openingAmountMinorUnits: 5000000,
        openedBy: DEMO_USER_ID,
      },
    ));

  if (
    !(await repos.cashMovements.findByRegisterAndSourceReference(
      tenant.id,
      DEMO_CASH_REGISTER_ID,
      DEMO_CASH_SALE_SOURCE_REF,
    ))
  ) {
    await recordMovement(
      { sessions: repos.cashSessions, movements: repos.cashMovements, outbox: repos.outbox, now: () => now },
      {
        tenantId: tenant.id,
        cashSessionId: liveSession.id,
        type: "CASH_SALE",
        amountMinorUnits: order.grandTotalMinorUnits,
        currency: tenant.defaultCurrency,
        actor: DEMO_USER_ID,
        sourceType: "ORDER",
        sourceReference: DEMO_CASH_SALE_SOURCE_REF,
        reason: "Seeded cash sale for live cashier demo",
      },
    );
  }

  if (
    !(await repos.cashMovements.findByRegisterAndSourceReference(
      tenant.id,
      DEMO_CASH_REGISTER_ID,
      DEMO_CASH_WITHDRAWAL_SOURCE_REF,
    ))
  ) {
    await recordMovement(
      { sessions: repos.cashSessions, movements: repos.cashMovements, outbox: repos.outbox, now: () => now },
      {
        tenantId: tenant.id,
        cashSessionId: liveSession.id,
        type: "WITHDRAWAL",
        amountMinorUnits: 50000,
        currency: tenant.defaultCurrency,
        actor: DEMO_USER_ID,
        sourceType: "PETTY_CASH",
        sourceReference: DEMO_CASH_WITHDRAWAL_SOURCE_REF,
        reason: "Seeded petty cash withdrawal for live cashier demo",
      },
    );
  }
}

/**
 * SPEC-145 — FISCAL_ARCA_DRIVER selects the ARCA authorization adapter. Only
 * "simulated" exists today (the default): a local, offline SimulatedArcaAdapter
 * that returns FAKE CAE values and NEVER contacts AFIP/ARCA. A future real
 * WSAA/WSFEv1 adapter implements the same ArcaAdapterPort and is selected here
 * (e.g. "wsfev1") without touching Invoice's domain/application code. See the
 * prominent warning at the top of SimulatedArcaAdapter — issuing invoices with
 * these fake CAE values in production is illegal.
 */
function buildArcaAdapter(): ArcaAdapterPort {
  const driver = process.env["FISCAL_ARCA_DRIVER"] ?? "simulated";
  // No real adapter exists yet, so any value resolves to the simulation. The
  // switch shape mirrors PERSISTENCE_DRIVER/AUTH_DRIVER for a future swap.
  if (driver !== "simulated") {
    // eslint-disable-next-line no-console
    console.warn(`FISCAL_ARCA_DRIVER="${driver}" is not implemented; falling back to the SIMULATED (fake CAE) adapter`);
  }
  return new SimulatedArcaAdapter();
}

/**
 * SPEC-023 — AUTH_DRIVER selects how bearer tokens are verified. When omitted,
 * the API auto-selects "supabase" if SUPABASE_URL is present; otherwise it
 * falls back to "fixture". "fixture" accepts only tokens registered via
 * registerToken(), used by tests and local dev. "supabase" verifies real
 * Supabase Auth access tokens against the project's JWKS
 * (SupabaseSessionVerificationPort) — no synthetic demoAccessToken exists in
 * that mode; callers must obtain a real token via Supabase Auth
 * (e.g. POST /auth/v1/token?grant_type=password).
 */
function buildSessionVerifier(): SessionVerificationPort {
  const driver = process.env["AUTH_DRIVER"] ?? (hasSupabaseAuthConfig() ? "supabase" : "fixture");
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

  return {
    ...repos,
    arca: buildArcaAdapter(),
    sessions,
    demoAccessToken: DEMO_ACCESS_TOKEN,
    demoQrMenuToken: DEMO_QR_MENU_TOKEN,
  };
}
