import {
  InMemoryTenantRepository,
  InMemoryBranchRepository,
  InMemoryBrandRepository,
  InMemoryBrandPresentationRepository,
  InMemoryBrandAssetRepository,
  InMemoryBrandAssetStorage,
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
  InMemoryAuthorizationAttemptRepository,
  InMemoryInvoiceDeliveryRepository,
  InMemoryFiscalPointOfSaleRepository,
  InMemoryFiscalPrinterRepository,
  InMemoryFiscalCertificateRepository,
  InMemoryInvoiceTemplateRepository,
  InMemoryTaxRateRepository,
  InMemoryCatalogItemRepository,
  InMemoryCatalogPackageRepository,
  FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";
import {
  createSupabaseClient,
  SupabaseTenantRepository,
  SupabaseBrandRepository,
  SupabaseBrandPresentationRepository,
  SupabaseBrandAssetRepository,
  SupabaseBrandAssetStorage,
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
  SupabaseAuthorizationAttemptRepository,
  SupabaseInvoiceDeliveryRepository,
  SupabaseFiscalPointOfSaleRepository,
  SupabaseFiscalPrinterRepository,
  SupabaseFiscalCertificateRepository,
  SupabaseInvoiceTemplateRepository,
  SupabaseTaxRateRepository,
  SupabaseCatalogItemRepository,
  SupabaseCatalogPackageRepository,
} from "@maitre/adapter-persistence-supabase";
import { registerE2EFixtures } from "./e2e-fixtures.js";
import {
  createTenant,
  createBrand,
  createBranch,
  createSalon,
  createTable,
  createFiscalEntity,
  type TenantRepositoryPort,
  type BrandRepositoryPort,
  type BrandPresentationRepositoryPort,
  type BrandAssetRepositoryPort,
  type BrandAssetStoragePort,
  type BrandPresentation,
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
  type CatalogPackage,
  type SubscriptionRepositoryPort,
  type SubscriptionItemRepositoryPort,
  type EntitlementRepositoryPort,
  type QuotaRepositoryPort,
  type CatalogRepositoryPort,
  type CatalogPackageRepositoryPort,
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
  Wsfev1ArcaAdapter,
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
  type AuthorizationAttemptRepositoryPort,
  type InvoiceDeliveryRepositoryPort,
} from "@maitre/fiscal";
import {
  FetchArcaHttpTransport,
  ForgeCmsSigner,
  MemoryWsaaTicketCache,
  WsaaClient,
  Wsfev1Client,
  ArcaError,
  type ArcaEnvironment,
  type ArcaCredentialProvider,
} from "@maitre/arca-client";
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
  brandPresentations: BrandPresentationRepositoryPort;
  brandAssets: BrandAssetRepositoryPort;
  brandAssetStorage: BrandAssetStoragePort;
  fiscalEntities: FiscalEntityRepositoryPort;
  salons: SalonRepositoryPort;
  tables: TableRepositoryPort;
  users: UserRepositoryPort;
  memberships: MembershipRepositoryPort;
  outbox: OutboxPort;
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  catalog: CatalogRepositoryPort;
  catalogPackages: CatalogPackageRepositoryPort;
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
  authorizationAttempts: AuthorizationAttemptRepositoryPort;
  invoiceDeliveries: InvoiceDeliveryRepositoryPort;
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
const DEMO_PRESENTATION_ID = "00000000-0000-0000-0000-000000000020";
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
  description: catalogDescription(code, name),
  benefits: catalogBenefits(code),
  billingType,
  billingScope,
  unitPrice,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn,
  isActive: true,
  version: 2,
});

const CATALOG_PURPOSE: Record<string, string> = {
  CORE: "centraliza la estructura del negocio, usuarios, permisos, auditoría y configuración común de Maitre",
  BRANCHES:
    "permite administrar sucursales adicionales dentro del mismo tenant con datos y operación aislados",
  IDENTITY:
    "gestiona accesos, roles y permisos para que cada persona vea y opere solamente lo que le corresponde",
  CONNECT:
    "integra Maitre con sistemas externos y automatiza el intercambio de información operativa",
  FLOOR:
    "digitaliza el salón, las mesas, ocupaciones, visitas, pedidos y precuentas de cada sucursal",
  SEATS:
    "define la capacidad simultánea habilitada del salón y acompaña el crecimiento de cada sucursal",
  RESERVATIONS:
    "organiza agenda, disponibilidad, reservas, confirmaciones, señas, cancelaciones y lista de espera",
  SHIFTS:
    "planifica jornadas, dotaciones, horarios y asignaciones del equipo por sucursal",
  SHIFT_SLOTS:
    "habilita franjas operativas diferenciadas como desayuno, almuerzo, merienda y cena",
  WAITERS:
    "habilita al personal de salón que puede recibir asignaciones y operar mesas durante el servicio",
  CASHIERS:
    "habilita cajeros o cajas concurrentes para registrar y controlar movimientos de dinero",
  KITCHEN:
    "coordina comandas, estaciones, preparación, estados y despacho entre salón y cocina",
  QR_MENU:
    "publica una carta digital actualizada con categorías, productos, precios e información del menú",
  QR_ORDERING:
    "permite que el cliente realice pedidos desde la mesa con aprobación y seguimiento operativo",
  GUEST:
    "consolida perfiles, preferencias e historial de clientes para brindar una atención más personalizada",
  DELIVERY:
    "organiza pedidos para entrega, estados de preparación y seguimiento del despacho",
  INVENTORY:
    "controla existencias, movimientos y disponibilidad de insumos vinculados a la operación",
  CASH: "administra cajas, aperturas, cierres, movimientos y conciliaciones por sucursal",
  BILLING: "gestiona documentos comerciales y facturación por entidad fiscal",
  PAYMENTS: "unifica el registro y la conciliación de distintos medios de pago",
  PAYLANDING:
    "genera páginas y enlaces de cobro para reservas, delivery y cuentas pendientes",
  ARCA: "automatiza la autorización fiscal y la emisión electrónica integrada con ARCA",
  IVA: "ordena registración, reportes y conciliación de IVA por entidad fiscal",
  FEEDBACK:
    "captura opiniones del cliente y las convierte en señales accionables para el equipo",
  REPUTATION:
    "centraliza reputación y reseñas para detectar problemas y oportunidades de mejora",
  CRM: "organiza segmentos, comunicaciones y relación comercial con clientes frecuentes",
  LOYALTY:
    "crea beneficios y recompensas para aumentar recurrencia y valor de cada cliente",
  AI_ASSISTANT:
    "ofrece asistencia contextual para consultar datos y resolver tareas con lenguaje natural",
  AI_FORECAST:
    "anticipa demanda y carga operativa utilizando el historial del negocio",
  AI_PROMISE:
    "estima compromisos realistas de reserva, preparación y atención según capacidad disponible",
  AI_KITCHEN:
    "detecta cuellos de botella y recomienda prioridades para mejorar tiempos de cocina",
  AI_AHEAD:
    "anticipa riesgos operativos combinando información de salón, reservas y cocina",
  AI_AUTOPILOT:
    "ejecuta acciones operativas autorizadas bajo políticas, límites y trazabilidad definidos",
};

const CATALOG_BENEFITS: Record<string, string[]> = {
  CORE: [
    "Unifica la configuración del negocio",
    "Mantiene permisos y auditoría centralizados",
  ],
  BRANCHES: [
    "Separa la operación por sucursal",
    "Consolida la gestión del grupo",
  ],
  IDENTITY: [
    "Reduce accesos indebidos",
    "Simplifica altas, bajas y cambios de rol",
  ],
  CONNECT: [
    "Evita carga duplicada de datos",
    "Sincroniza sistemas externos con Maitre",
  ],
  FLOOR: [
    "Agiliza la rotación de mesas",
    "Da visibilidad del salón en tiempo real",
  ],
  SEATS: [
    "Ajusta la capacidad habilitada por sucursal",
    "Define límites operativos claros",
  ],
  RESERVATIONS: [
    "Ordena la demanda antes del servicio",
    "Reduce ausencias y sobreventa",
  ],
  SHIFTS: ["Alinea dotación y demanda", "Facilita el control de jornadas"],
  SHIFT_SLOTS: [
    "Separa la operación por franja horaria",
    "Mejora la planificación diaria",
  ],
  WAITERS: [
    "Controla quién puede operar mesas",
    "Facilita asignaciones de salón",
  ],
  CASHIERS: [
    "Controla cajas concurrentes",
    "Define responsables de cada turno",
  ],
  KITCHEN: [
    "Reduce demoras y comandas perdidas",
    "Coordina prioridades de preparación",
  ],
  QR_MENU: [
    "Mantiene precios y productos actualizados",
    "Evita reimpresiones de carta",
  ],
  QR_ORDERING: [
    "Reduce tiempos de toma de pedido",
    "Permite seguimiento desde la mesa",
  ],
  GUEST: [
    "Recuerda preferencias del cliente",
    "Mejora la personalización del servicio",
  ],
  DELIVERY: ["Ordena preparación y despacho", "Da seguimiento a cada entrega"],
  INVENTORY: [
    "Previene faltantes de insumos",
    "Mejora el control de movimientos",
  ],
  CASH: ["Trazabilidad de aperturas y cierres", "Reduce diferencias de caja"],
  BILLING: [
    "Centraliza documentos comerciales",
    "Separa la facturación por entidad fiscal",
  ],
  PAYMENTS: ["Unifica medios de pago", "Simplifica conciliaciones"],
  PAYLANDING: [
    "Permite cobrar antes o después del servicio",
    "Reduce pagos pendientes",
  ],
  ARCA: ["Evita carga fiscal duplicada", "Acelera la emisión de comprobantes"],
  IVA: ["Ordena información impositiva", "Facilita conciliación y control"],
  FEEDBACK: [
    "Detecta problemas rápidamente",
    "Prioriza mejoras basadas en clientes",
  ],
  REPUTATION: [
    "Centraliza reseñas externas",
    "Identifica tendencias de satisfacción",
  ],
  CRM: [
    "Segmenta clientes por comportamiento",
    "Mejora la relevancia de comunicaciones",
  ],
  LOYALTY: ["Aumenta la recurrencia", "Reconoce a los clientes frecuentes"],
  AI_ASSISTANT: [
    "Acelera consultas operativas",
    "Reduce tiempo buscando información",
  ],
  AI_FORECAST: [
    "Anticipa picos de demanda",
    "Mejora la planificación de recursos",
  ],
  AI_PROMISE: [
    "Evita promesas difíciles de cumplir",
    "Ajusta tiempos a la capacidad real",
  ],
  AI_KITCHEN: [
    "Detecta cuellos de botella",
    "Mejora prioridades de preparación",
  ],
  AI_AHEAD: [
    "Alerta riesgos antes del servicio",
    "Conecta señales de salón, reservas y cocina",
  ],
  AI_AUTOPILOT: [
    "Automatiza acciones repetitivas autorizadas",
    "Conserva control y trazabilidad",
  ],
};

function catalogDescription(code: string, name: string) {
  const connectorProvider = code.startsWith("PAYLANDING.")
    ? code.replace("PAYLANDING.", "").replaceAll("_", " ")
    : null;
  const purpose =
    CATALOG_PURPOSE[code] ??
    (connectorProvider
      ? `Conecta PayLanding con ${connectorProvider} para procesar cobros con ese proveedor`
      : `${name} agrega una capacidad especializada a la operación`);
  return `${purpose.charAt(0).toUpperCase()}${purpose.slice(1)}.`;
}

function catalogBenefits(code: string): string[] {
  if (code.startsWith("AI_")) {
    return CATALOG_BENEFITS[code] ?? [];
  }
  if (code.startsWith("PAYLANDING.")) {
    return [
      "Ofrece ese medio de pago al cliente",
      "Registra el estado del cobro en Maitre",
    ];
  }
  return CATALOG_BENEFITS[code] ?? [];
}

const SEED_CATALOG_ITEMS: CatalogItem[] = [
  catalogItem("CORE", "Maitre Core", "SERVICE", "TENANT", 15_000),
  catalogItem("BRANCHES", "Maitre Branches", "QUANTITY", "TENANT", 8_000, [
    "CORE",
  ]),
  catalogItem("IDENTITY", "Maitre Identity", "SERVICE", "TENANT", 0, ["CORE"]),
  catalogItem("CONNECT", "Maitre Connect", "SERVICE", "BRANCH", 3_000, [
    "CORE",
  ]),
  catalogItem("FLOOR", "Maitre Floor", "SERVICE", "BRANCH", 6_000, [
    "CORE",
    "BRANCHES",
  ]),
  catalogItem("SEATS", "Plazas", "QUANTITY", "BRANCH", 500, ["FLOOR"]),
  catalogItem(
    "RESERVATIONS",
    "Maitre Reservations",
    "SERVICE",
    "BRANCH",
    4_000,
    ["CORE", "BRANCHES"],
  ),
  catalogItem("SHIFTS", "Maitre Shifts", "SERVICE", "BRANCH", 3_000, [
    "CORE",
    "BRANCHES",
  ]),
  catalogItem("SHIFT_SLOTS", "Turnos", "QUANTITY", "BRANCH", 300, ["SHIFTS"]),
  catalogItem("WAITERS", "Mozos", "QUANTITY", "BRANCH", 1_200, ["FLOOR"]),
  catalogItem("CASHIERS", "Cajeros", "QUANTITY", "BRANCH", 1_500, ["CASH"]),
  catalogItem("KITCHEN", "Maitre Kitchen", "SERVICE", "BRANCH", 5_000, [
    "FLOOR",
  ]),
  catalogItem("QR_MENU", "Maitre QR Menu", "SERVICE", "BRANCH", 2_000, [
    "CORE",
  ]),
  catalogItem("QR_ORDERING", "Maitre QR Ordering", "SERVICE", "BRANCH", 3_000, [
    "QR_MENU",
  ]),
  catalogItem("GUEST", "Maitre Guest", "SERVICE", "BRANCH", 2_000, ["CORE"]),
  catalogItem("DELIVERY", "Maitre Delivery", "SERVICE", "BRANCH", 4_000, [
    "CORE",
  ]),
  catalogItem("INVENTORY", "Maitre Inventory", "SERVICE", "BRANCH", 5_000, [
    "CORE",
  ]),
  catalogItem("CASH", "Maitre Cash", "SERVICE", "BRANCH", 3_500, ["CORE"]),
  catalogItem("BILLING", "Maitre Billing", "SERVICE", "FISCAL_ENTITY", 5_000, [
    "CORE",
  ]),
  catalogItem("PAYMENTS", "Maitre Payments", "SERVICE", "TENANT", 4_000, [
    "CASH",
  ]),
  catalogItem("PAYLANDING", "Maitre PayLanding", "SERVICE", "TENANT", 3_000, [
    "PAYMENTS",
  ]),
  catalogItem(
    "PAYLANDING.MERCADOPAGO",
    "PayLanding — Mercado Pago",
    "SERVICE",
    "CONNECTOR",
    0,
    ["PAYLANDING"],
  ),
  catalogItem(
    "PAYLANDING.NARANJA_X",
    "PayLanding — Naranja X",
    "SERVICE",
    "CONNECTOR",
    0,
    ["PAYLANDING"],
  ),
  catalogItem(
    "PAYLANDING.MODO",
    "PayLanding — MODO",
    "SERVICE",
    "CONNECTOR",
    0,
    ["PAYLANDING"],
  ),
  catalogItem(
    "PAYLANDING.TODO_PAGO",
    "PayLanding — Todo Pago",
    "SERVICE",
    "CONNECTOR",
    0,
    ["PAYLANDING"],
  ),
  catalogItem("ARCA", "Maitre ARCA", "SERVICE", "FISCAL_ENTITY", 7_000, [
    "BILLING",
  ]),
  catalogItem("IVA", "Maitre IVA", "SERVICE", "FISCAL_ENTITY", 4_000, [
    "BILLING",
  ]),
  catalogItem("FEEDBACK", "Maitre Feedback", "SERVICE", "BRANCH", 2_500, [
    "CORE",
  ]),
  catalogItem("REPUTATION", "Maitre Reputation", "SERVICE", "BRANCH", 3_500, [
    "CORE",
  ]),
  catalogItem("CRM", "Maitre CRM", "SERVICE", "BRAND", 4_500, ["CORE"]),
  catalogItem("LOYALTY", "Maitre Loyalty", "SERVICE", "BRAND", 4_000, ["CRM"]),
  catalogItem(
    "AI_ASSISTANT",
    "Maitre AI Assistant",
    "SERVICE",
    "TENANT",
    8_000,
    ["CORE"],
  ),
  catalogItem("AI_FORECAST", "Maitre AI Forecast", "SERVICE", "BRANCH", 7_000, [
    "CORE",
  ]),
  catalogItem("AI_PROMISE", "Maitre AI Promise", "SERVICE", "BRANCH", 7_000, [
    "RESERVATIONS",
  ]),
  catalogItem("AI_KITCHEN", "Maitre AI Kitchen", "SERVICE", "BRANCH", 7_000, [
    "KITCHEN",
  ]),
  catalogItem("AI_AHEAD", "Maitre Ahead", "SERVICE", "BRANCH", 10_000, [
    "FLOOR",
    "RESERVATIONS",
    "KITCHEN",
  ]),
  catalogItem("AI_AUTOPILOT", "Maitre Autopilot", "SERVICE", "BRANCH", 12_000, [
    "AI_AHEAD",
  ]),
];

const SEED_CATALOG_PACKAGES: CatalogPackage[] = [
  {
    code: "BASE_OPERATIVA",
    name: "Base Operativa",
    tagline: "Lo mínimo indispensable para comenzar a operar",
    description:
      "Una configuración inicial para digitalizar una sucursal pequeña: estructura central, salón, capacidad para veinte comensales y control básico de caja.",
    benefits: [
      "Menor inversión mensual para iniciar",
      "Operación centralizada de salón y caja",
      "Base preparada para agregar módulos sin migraciones",
    ],
    items: [
      { catalogItemCode: "CORE" },
      { catalogItemCode: "BRANCHES", quantity: 1 },
      { catalogItemCode: "FLOOR" },
      { catalogItemCode: "SEATS", quantity: 20 },
      { catalogItemCode: "CASH" },
    ],
    isActive: true,
    sortOrder: 10,
    version: 1,
  },
  {
    code: "ESENCIAL",
    name: "Esencial",
    tagline: "Más capacidad comercial a un precio accesible",
    description:
      "Pensado para restaurantes en crecimiento que necesitan reservas, carta QR y una dotación inicial de salón y caja, manteniendo una configuración simple.",
    benefits: [
      "Reduce tareas manuales de reservas y atención",
      "Incluye una experiencia digital para el cliente",
      "Acompaña un equipo inicial de cuatro mozos y un cajero",
    ],
    items: [
      { catalogItemCode: "CORE" },
      { catalogItemCode: "BRANCHES", quantity: 1 },
      { catalogItemCode: "FLOOR" },
      { catalogItemCode: "SEATS", quantity: 40 },
      { catalogItemCode: "CASH" },
      { catalogItemCode: "RESERVATIONS" },
      { catalogItemCode: "QR_MENU" },
      { catalogItemCode: "WAITERS", quantity: 4 },
      { catalogItemCode: "CASHIERS", quantity: 1 },
    ],
    isActive: true,
    sortOrder: 20,
    version: 1,
  },
  {
    code: "GESTION_INTEGRAL",
    name: "Gestión Integral",
    tagline: "Operación conectada para equipos con mayor volumen",
    description:
      "Una propuesta intermedia completa que conecta salón, reservas, turnos, cocina, pedidos QR y caja para coordinar el servicio de punta a punta.",
    benefits: [
      "Visibilidad integral desde la reserva hasta el cierre de caja",
      "Mejor coordinación entre salón y cocina",
      "Capacidad inicial para ochenta plazas, ocho mozos y dos cajeros",
    ],
    items: [
      { catalogItemCode: "CORE" },
      { catalogItemCode: "BRANCHES", quantity: 1 },
      { catalogItemCode: "FLOOR" },
      { catalogItemCode: "SEATS", quantity: 80 },
      { catalogItemCode: "CASH" },
      { catalogItemCode: "RESERVATIONS" },
      { catalogItemCode: "SHIFTS" },
      { catalogItemCode: "SHIFT_SLOTS", quantity: 3 },
      { catalogItemCode: "WAITERS", quantity: 8 },
      { catalogItemCode: "CASHIERS", quantity: 2 },
      { catalogItemCode: "KITCHEN" },
      { catalogItemCode: "QR_MENU" },
      { catalogItemCode: "QR_ORDERING" },
    ],
    isActive: true,
    sortOrder: 30,
    version: 1,
  },
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
  brandPresentations: BrandPresentationRepositoryPort;
  brandAssets: BrandAssetRepositoryPort;
  brandAssetStorage: BrandAssetStoragePort;
  fiscalEntities: FiscalEntityRepositoryPort;
  salons: SalonRepositoryPort;
  tables: TableRepositoryPort;
  users: UserRepositoryPort;
  memberships: MembershipRepositoryPort;
  outbox: OutboxPort;
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  catalog: CatalogRepositoryPort;
  catalogPackages: CatalogPackageRepositoryPort;
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
  authorizationAttempts: AuthorizationAttemptRepositoryPort;
  invoiceDeliveries: InvoiceDeliveryRepositoryPort;
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

export type PersistenceDriver = "memory" | "supabase";
export type AuthenticationDriver = "fixture" | "supabase";

export interface RuntimeProfile {
  environment: string;
  persistenceDriver: PersistenceDriver;
  authenticationDriver: AuthenticationDriver;
  durable: boolean;
}

const LOCAL_RUNTIME_ENVIRONMENTS = new Set(["local", "test", "e2e"]);

function hasSupabasePersistenceConfig(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(
    env["SUPABASE_URL"] &&
    (env["SUPABASE_SECRET_KEY"] || env["SUPABASE_SERVICE_ROLE_KEY"]),
  );
}

function hasSupabaseAuthConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env["SUPABASE_URL"]);
}

export function resolveRuntimeProfile(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeProfile {
  const environment =
    env["APP_ENV"] ?? env["VERCEL_ENV"] ?? env["NODE_ENV"] ?? "local";
  const sharedEnvironment = !LOCAL_RUNTIME_ENVIRONMENTS.has(environment);
  if (sharedEnvironment && !env["PERSISTENCE_DRIVER"]) {
    throw new Error(
      `PERSISTENCE_DRIVER must be explicitly configured for APP_ENV=${environment}`,
    );
  }
  if (sharedEnvironment && !env["AUTH_DRIVER"]) {
    throw new Error(
      `AUTH_DRIVER must be explicitly configured for APP_ENV=${environment}`,
    );
  }
  const persistenceDriver =
    env["PERSISTENCE_DRIVER"] ??
    (hasSupabasePersistenceConfig(env) ? "supabase" : "memory");
  const authenticationDriver =
    env["AUTH_DRIVER"] ?? (hasSupabaseAuthConfig(env) ? "supabase" : "fixture");

  if (!["memory", "supabase"].includes(persistenceDriver)) {
    throw new Error(`Unsupported PERSISTENCE_DRIVER: ${persistenceDriver}`);
  }
  if (!["fixture", "supabase"].includes(authenticationDriver)) {
    throw new Error(`Unsupported AUTH_DRIVER: ${authenticationDriver}`);
  }
  if (persistenceDriver === "supabase" && !hasSupabasePersistenceConfig(env)) {
    throw new Error(
      "SUPABASE_URL and a server-side Supabase secret are required for PERSISTENCE_DRIVER=supabase",
    );
  }
  if (authenticationDriver === "supabase" && !hasSupabaseAuthConfig(env)) {
    throw new Error("SUPABASE_URL is required for AUTH_DRIVER=supabase");
  }
  if (sharedEnvironment) {
    if (persistenceDriver !== "supabase") {
      throw new Error(
        `Durable persistence is required for APP_ENV=${environment}; memory is local/test only`,
      );
    }
    if (authenticationDriver !== "supabase") {
      throw new Error(
        `Supabase authentication is required for APP_ENV=${environment}; fixture auth is local/test only`,
      );
    }
  }

  return {
    environment,
    persistenceDriver: persistenceDriver as PersistenceDriver,
    authenticationDriver: authenticationDriver as AuthenticationDriver,
    durable: persistenceDriver === "supabase",
  };
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
function buildRepositories(profile: RuntimeProfile): Repositories {
  if (profile.persistenceDriver === "supabase") {
    const client = createSupabaseClient();
    return {
      tenants: new SupabaseTenantRepository(client),
      branches: new SupabaseBranchRepository(client),
      brands: new SupabaseBrandRepository(client),
      brandPresentations: new SupabaseBrandPresentationRepository(client),
      brandAssets: new SupabaseBrandAssetRepository(client),
      brandAssetStorage: new SupabaseBrandAssetStorage(client),
      fiscalEntities: new SupabaseFiscalEntityRepository(client),
      salons: new SupabaseSalonRepository(client),
      tables: new SupabaseTableRepository(client),
      users: new SupabaseUserRepository(client),
      memberships: new SupabaseMembershipRepository(client),
      outbox: new SupabaseOutboxRepository(client),
      subscriptions: new SupabaseSubscriptionRepository(client),
      subscriptionItems: new SupabaseSubscriptionItemRepository(client),
      catalog: new SupabaseCatalogItemRepository(client),
      catalogPackages: new SupabaseCatalogPackageRepository(client),
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
      reservationPreferences: new SupabaseReservationPreferenceRepository(
        client,
      ),
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
      authorizationAttempts: new SupabaseAuthorizationAttemptRepository(client),
      invoiceDeliveries: new SupabaseInvoiceDeliveryRepository(client),
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
    brandPresentations: new InMemoryBrandPresentationRepository(),
    brandAssets: new InMemoryBrandAssetRepository(),
    brandAssetStorage: new InMemoryBrandAssetStorage(),
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
    catalogPackages: new InMemoryCatalogPackageRepository(
      SEED_CATALOG_PACKAGES,
    ),
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
    authorizationAttempts: new InMemoryAuthorizationAttemptRepository(),
    invoiceDeliveries: new InMemoryInvoiceDeliveryRepository(),
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
async function ensureSeed(
  repos: Repositories,
  profile: RuntimeProfile,
): Promise<void> {
  const now = new Date();
  const seedOperationalDemo = profile.persistenceDriver === "supabase";

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
      {
        tenants: repos.tenants,
        brands: repos.brands,
        outbox: repos.outbox,
        now: () => now,
      },
      {
        id: DEMO_BRAND_ID,
        tenantId: tenant.id,
        name: "Maitre Demo Brand",
        config: { language: "es", currency: tenant.defaultCurrency },
      },
    );
  }

  const demoAssets = [
    {
      id: "00000000-0000-0000-0000-000000000021",
      kind: "LOGO" as const,
      file: "logo.svg",
      mimeType: "image/svg+xml",
      width: 640,
      height: 180,
    },
    {
      id: "00000000-0000-0000-0000-000000000022",
      kind: "LOGO_DARK" as const,
      file: "logo-dark.svg",
      mimeType: "image/svg+xml",
      width: 640,
      height: 180,
    },
    {
      id: "00000000-0000-0000-0000-000000000023",
      kind: "FAVICON" as const,
      file: "favicon.svg",
      mimeType: "image/svg+xml",
      width: 128,
      height: 128,
    },
    {
      id: "00000000-0000-0000-0000-000000000024",
      kind: "HERO" as const,
      file: "hero.png",
      mimeType: "image/png",
      width: 1664,
      height: 936,
    },
  ];
  for (const definition of demoAssets) {
    if (await repos.brandAssets.findById(tenant.id, brand.id, definition.id))
      continue;
    const bytes = await readFile(
      new URL(`../../assets/demo-brand/${definition.file}`, import.meta.url),
    );
    const storagePath = `tenants/${tenant.id}/brands/${brand.id}/${definition.kind.toLowerCase()}/${definition.id}/${definition.file}`;
    await repos.brandAssetStorage.put(storagePath, bytes, definition.mimeType);
    await repos.brandAssets.save({
      id: definition.id,
      tenantId: tenant.id,
      brandId: brand.id,
      kind: definition.kind,
      storageBucket: "brand-assets",
      storagePath,
      publicUrl: `/public/tenants/${tenant.id}/brands/${brand.id}/assets/${definition.id}`,
      mimeType: definition.mimeType,
      sizeBytes: bytes.byteLength,
      checksum: createHash("sha256").update(bytes).digest("hex"),
      width: definition.width,
      height: definition.height,
      status: "READY",
      createdAt: now,
      createdBy: DEMO_USER_ID,
    });
  }

  if (!(await repos.brandPresentations.findPublished(tenant.id, brand.id))) {
    const presentation: BrandPresentation = {
      id: DEMO_PRESENTATION_ID,
      tenantId: tenant.id,
      brandId: brand.id,
      revision: 1,
      status: "PUBLISHED",
      document: {
        schemaVersion: 1,
        identity: {
          displayName: "Casa Maitre",
          shortName: "Casa Maitre",
          tagline: "Cocina porteña, servicio contemporáneo",
        },
        assets: {
          logo: {
            assetId: demoAssets[0]!.id,
            kind: "LOGO",
            url: `/public/tenants/${tenant.id}/brands/${brand.id}/assets/${demoAssets[0]!.id}`,
            mimeType: "image/svg+xml",
            checksum: "demo-logo-v1",
            width: 640,
            height: 180,
          },
          logoDark: {
            assetId: demoAssets[1]!.id,
            kind: "LOGO_DARK",
            url: `/public/tenants/${tenant.id}/brands/${brand.id}/assets/${demoAssets[1]!.id}`,
            mimeType: "image/svg+xml",
            checksum: "demo-logo-dark-v1",
            width: 640,
            height: 180,
          },
          favicon: {
            assetId: demoAssets[2]!.id,
            kind: "FAVICON",
            url: `/public/tenants/${tenant.id}/brands/${brand.id}/assets/${demoAssets[2]!.id}`,
            mimeType: "image/svg+xml",
            checksum: "demo-favicon-v1",
            width: 128,
            height: 128,
          },
          hero: {
            assetId: demoAssets[3]!.id,
            kind: "HERO",
            url: `/public/tenants/${tenant.id}/brands/${brand.id}/assets/${demoAssets[3]!.id}`,
            mimeType: "image/png",
            checksum: "demo-hero-v1",
            width: 1664,
            height: 936,
          },
        },
        colors: {
          primary: "#A63D2F",
          secondary: "#24352E",
          accent: "#D49A4A",
          canvas: "#F7F1E7",
          surface: "#FFFDF8",
          text: "#211D19",
          mutedText: "#655E56",
          border: "#D9CDBD",
        },
        typography: {
          heading: {
            family: "Georgia",
            fallback: "Georgia, serif",
            weights: [400, 700],
          },
          body: {
            family: "Inter",
            fallback: "system-ui, sans-serif",
            weights: [400, 600, 700],
          },
          numeric: {
            family: "Inter",
            fallback: "ui-monospace, monospace",
            weights: [600, 700],
          },
          scale: "comfortable",
        },
        shape: { radius: "medium", elevation: "subtle" },
        templates: {
          PUBLIC_HOME: { templateId: "image-led", variant: "warm" },
          MENU: { templateId: "visual", variant: "editorial" },
          RESERVATION: { templateId: "guided" },
          WAITER: { templateId: "comfortable" },
          HOST: { templateId: "floor-first" },
          KITCHEN: { templateId: "high-contrast" },
          CASHIER: { templateId: "compact" },
          DASH: { templateId: "standard" },
        },
        content: { locale: "es-AR" },
      },
      createdAt: now,
      createdBy: DEMO_USER_ID,
      publishedAt: now,
      publishedBy: DEMO_USER_ID,
    };
    await repos.brandPresentations.save(presentation);
  }

  let branch = await repos.branches.findById(tenant.id, DEMO_BRANCH_ID);
  if (!branch) {
    branch = await createBranch(
      {
        brands: repos.brands,
        branches: repos.branches,
        outbox: repos.outbox,
        now: () => now,
      },
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
    const existing = await repos.catalog.findByCode(item.code);
    if (!existing || existing.version < item.version) {
      await (
        repos.catalog as CatalogRepositoryPort & {
          save(item: CatalogItem): Promise<void>;
        }
      ).save(item);
    }
  }
  for (const catalogPackage of SEED_CATALOG_PACKAGES) {
    const existing = await repos.catalogPackages.findByCode(
      catalogPackage.code,
    );
    if (!existing || existing.version < catalogPackage.version) {
      await repos.catalogPackages.save(catalogPackage);
    }
  }

  let subscription = await repos.subscriptions.findById(DEMO_SUBSCRIPTION_ID);
  if (!subscription) {
    subscription = await createSubscription(
      {
        subscriptions: repos.subscriptions,
        subscriptionItems: repos.subscriptionItems,
        entitlements: repos.entitlements,
        catalog: repos.catalog,
        now: () => now,
      },
      {
        id: DEMO_SUBSCRIPTION_ID,
        tenantId: tenant.id,
        planCode: "PROFESSIONAL",
      },
    );
  }

  const itemDeps = {
    subscriptions: repos.subscriptions,
    subscriptionItems: repos.subscriptionItems,
    catalog: repos.catalog,
    entitlements: repos.entitlements,
    outbox: repos.outbox,
    now: () => now,
  };
  const ensureService = async (serviceId: string, scopeRefId?: string) => {
    const existing = await repos.subscriptionItems.findByServiceId(
      DEMO_SUBSCRIPTION_ID,
      serviceId,
      scopeRefId ?? null,
    );
    if (!existing)
      await addService(itemDeps, {
        subscriptionId: DEMO_SUBSCRIPTION_ID,
        serviceId,
        ...(scopeRefId ? { scopeRefId } : {}),
      });
  };
  const ensureQuantity = async (
    catalogItemCode: string,
    quantity: number,
    scopeRefId?: string,
  ) => {
    const existing = await repos.subscriptionItems.findByServiceId(
      DEMO_SUBSCRIPTION_ID,
      catalogItemCode,
      scopeRefId ?? null,
    );
    if (!existing)
      await addQuantityItem(itemDeps, {
        subscriptionId: DEMO_SUBSCRIPTION_ID,
        catalogItemCode,
        quantity,
        ...(scopeRefId ? { scopeRefId } : {}),
      });
  };
  await ensureService("CORE");
  await ensureQuantity("BRANCHES", 1);
  await ensureService("FLOOR", DEMO_BRANCH_ID);
  await ensureQuantity("SEATS", 12, DEMO_BRANCH_ID);
  await ensureQuantity("WAITERS", 8, DEMO_BRANCH_ID);
  await ensureQuantity("CASHIERS", 3, DEMO_BRANCH_ID);
  await ensureService("KITCHEN", DEMO_BRANCH_ID);
  await ensureService("CASH", DEMO_BRANCH_ID);
  await ensureService("PAYMENTS", DEMO_BRANCH_ID);
  await ensureService("RESERVATIONS", DEMO_BRANCH_ID);
  await ensureService("QR_MENU", DEMO_BRANCH_ID);

  let menu = await repos.menus.findById(tenant.id, DEMO_MENU_ID);
  if (!menu) {
    menu = await createMenu(
      { menus: repos.menus, now: () => now },
      {
        id: DEMO_MENU_ID,
        tenantId: tenant.id,
        brandId: brand.id,
        name: "Menú Principal",
        isDefault: true,
      },
    );
  }

  let category = await repos.categories.findById(tenant.id, DEMO_CATEGORY_ID);
  if (!category) {
    category = await createCategory(
      { menus: repos.menus, categories: repos.categories, now: () => now },
      {
        id: DEMO_CATEGORY_ID,
        tenantId: tenant.id,
        menuId: menu.id,
        name: "Entradas",
      },
    );
  }

  const product = await repos.products.findById(tenant.id, DEMO_PRODUCT_ID);
  if (!product) {
    await createProduct(
      {
        categories: repos.categories,
        products: repos.products,
        now: () => now,
      },
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
  const existingQr = await repos.capabilityTokens.findByHash(
    hashToken(DEMO_QR_MENU_TOKEN),
  );
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
  const cashRegister = await repos.cashRegisters.findById(
    tenant.id,
    DEMO_CASH_REGISTER_ID,
  );
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
    let fiscalEntity = await repos.fiscalEntities.findByCuit(
      tenant.id,
      DEMO_FISCAL_ENTITY_CUIT,
    );
    if (!fiscalEntity) {
      fiscalEntity = await createFiscalEntity(
        {
          tenants: repos.tenants,
          fiscalEntities: repos.fiscalEntities,
          outbox: repos.outbox,
          now: () => now,
        },
        {
          tenantId: tenant.id,
          cuit: DEMO_FISCAL_ENTITY_CUIT,
          name: "Maitre Demo Fiscal Entity",
          taxCondition: "RI",
          createIdempotencyKey: "demo-fiscal-entity",
        },
      );
    }

    const demoPos = await repos.fiscalPointsOfSale.findById(
      tenant.id,
      DEMO_FISCAL_POS_ID,
    );
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
      await publishTaxRate(
        { taxRates: repos.taxRates, now: () => now },
        { id: DEMO_TAX_RATE_ID },
      );
    }
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "PGRST205"
    ) {
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

  let servicePeriod = await repos.servicePeriods.findById(
    tenant.id,
    DEMO_SERVICE_PERIOD_ID,
  );
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

  let reservation = await repos.reservations.findById(
    tenant.id,
    DEMO_RESERVATION_ID,
  );
  if (!reservation) {
    reservation = await createReservation(
      {
        reservations: repos.reservations,
        outbox: repos.outbox,
        now: () => now,
      },
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
      {
        reservations: repos.reservations,
        outbox: repos.outbox,
        now: () => now,
      },
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

  const waitlist = await repos.waitlistEntries.findById(
    tenant.id,
    DEMO_WAITLIST_ID,
  );
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
      {
        visits: repos.visits,
        occupancies: repos.occupancies,
        outbox: repos.outbox,
        now: () => now,
      },
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
      {
        checks: repos.checks,
        visits: repos.visits,
        outbox: repos.outbox,
        now: () => now,
      },
      {
        tenantId: tenant.id,
        visitId: DEMO_VISIT_ID,
        currency: tenant.defaultCurrency,
      },
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
  if (
    check &&
    !check.lines.some((line) => line.description === `Order ${order.id}`)
  ) {
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

  const existingCommands = await repos.commands.listByOrder(
    tenant.id,
    DEMO_ORDER_ID,
  );
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
      {
        registers: repos.cashRegisters,
        sessions: repos.cashSessions,
        now: () => now,
      },
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
      {
        sessions: repos.cashSessions,
        movements: repos.cashMovements,
        outbox: repos.outbox,
        now: () => now,
      },
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
      {
        sessions: repos.cashSessions,
        movements: repos.cashMovements,
        outbox: repos.outbox,
        now: () => now,
      },
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

function pemFromEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ArcaError(`${name} is required for the WSFEv1 driver`, {
      kind: "CONFIGURATION",
    });
  }
  return value.replaceAll("\\n", "\n");
}

function buildArcaCredentialProvider(): ArcaCredentialProvider {
  return {
    async getCredentials({ environment, representedCuit }) {
      const prefix =
        environment === "homologation"
          ? "ARCA_HOMOLOGATION"
          : "ARCA_PRODUCTION";
      const configuredCuit = process.env[`${prefix}_CUIT`];
      if (configuredCuit && configuredCuit !== representedCuit) {
        throw new ArcaError(
          `Configured ${prefix}_CUIT cannot represent the requested fiscal entity`,
          { kind: "CONFIGURATION" },
        );
      }
      return {
        representedCuit,
        certificatePem: pemFromEnvironment(`${prefix}_CERTIFICATE_PEM`),
        privateKeyPem: pemFromEnvironment(`${prefix}_PRIVATE_KEY_PEM`),
      };
    },
  };
}

/**
 * SPEC-145 — FISCAL_ARCA_DRIVER selects the authorization adapter.
 * Unknown/invalid real-driver configuration fails closed: it never falls back
 * to fake CAEs. The issue workflow applies the production registration gate.
 */
function buildArcaAdapter(): ArcaAdapterPort {
  const driver = process.env["FISCAL_ARCA_DRIVER"] ?? "simulated";
  if (driver === "simulated") {
    return new SimulatedArcaAdapter();
  }
  if (driver !== "wsfev1") {
    throw new ArcaError(`Unsupported FISCAL_ARCA_DRIVER="${driver}"`, {
      kind: "CONFIGURATION",
    });
  }

  const transport = new FetchArcaHttpTransport({
    timeoutMs: Number.parseInt(
      process.env["ARCA_HTTP_TIMEOUT_MS"] ?? "15000",
      10,
    ),
  });
  const signer = new ForgeCmsSigner();
  const cache = new MemoryWsaaTicketCache();
  const credentials = buildArcaCredentialProvider();
  const clients = new Map<string, Wsfev1Client>();

  return new Wsfev1ArcaAdapter({
    clientFor({ cuit, environment }) {
      const arcaEnvironment: ArcaEnvironment =
        environment === "HOMOLOGATION" ? "homologation" : "production";
      const key = `${arcaEnvironment}:${cuit}`;
      const existing = clients.get(key);
      if (existing) return existing;
      const wsaa = new WsaaClient({
        environment: arcaEnvironment,
        representedCuit: cuit,
        transport,
        credentials,
        signer,
        cache,
      });
      const client = new Wsfev1Client({
        environment: arcaEnvironment,
        representedCuit: cuit,
        transport,
        tickets: wsaa,
      });
      clients.set(key, client);
      return client;
    },
  });
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
function buildSessionVerifier(
  profile: RuntimeProfile,
): SessionVerificationPort {
  if (profile.authenticationDriver === "supabase") {
    const url = process.env["SUPABASE_URL"];
    if (!url)
      throw new Error("SUPABASE_URL must be set for AUTH_DRIVER=supabase");
    return new SupabaseSessionVerificationPort(url, {
      ...(process.env["SUPABASE_PUBLISHABLE_KEY"]
        ? { apiKey: process.env["SUPABASE_PUBLISHABLE_KEY"] }
        : {}),
    });
  }
  return new FixtureSessionVerificationPort();
}

export async function buildContainer(): Promise<Container> {
  const profile = resolveRuntimeProfile();
  const repos = buildRepositories(profile);
  await ensureSeed(repos, profile);

  const sessions = buildSessionVerifier(profile);
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
    await registerE2EFixtures(repos, sessions, DEMO_TENANT_ID, DEMO_BRANCH_ID);
  }

  return {
    ...repos,
    arca: buildArcaAdapter(),
    sessions,
    demoAccessToken: DEMO_ACCESS_TOKEN,
    demoQrMenuToken: DEMO_QR_MENU_TOKEN,
  };
}
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
