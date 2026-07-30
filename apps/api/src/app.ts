import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { buildContainer, type Container } from "./composition/container.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerMeRoutes } from "./routes/me.js";
import { registerTenantRoutes } from "./routes/tenants.js";
import { registerBrandRoutes } from "./routes/brands.js";
import { registerBrandPresentationRoutes } from "./routes/brand-presentations.js";
import { registerFiscalEntityRoutes } from "./routes/fiscal-entities.js";
import { registerBranchRoutes } from "./routes/branches.js";
import { registerSalonRoutes } from "./routes/salons.js";
import { registerTableRoutes } from "./routes/tables.js";
import { registerUserRoutes } from "./routes/users.js";
import { registerRoleRoutes } from "./routes/roles.js";
import { registerSubscriptionRoutes } from "./routes/subscriptions.js";
import { registerEntitlementRoutes } from "./routes/entitlements.js";
import { registerMenuRoutes } from "./routes/menus.js";
import { registerCategoryRoutes } from "./routes/categories.js";
import { registerProductRoutes } from "./routes/products.js";
import { registerAuditLogRoutes } from "./routes/audit-logs.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerVisitRoutes } from "./routes/visits.js";
import { registerOccupancyRoutes } from "./routes/occupancy.js";
import { registerTableStatusRoutes } from "./routes/table-status.js";
import { registerCheckRoutes } from "./routes/checks.js";
import { registerPaymentRoutes } from "./routes/payments.js";
import { registerServicePeriodRoutes } from "./routes/service-periods.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerCustomerReservationRoutes } from "./routes/customer-reservations.js";
import { registerGuestRoutes } from "./routes/guests.js";
import { registerWaitlistRoutes } from "./routes/waitlist.js";
import { registerAvailabilityRoutes } from "./routes/availability.js";
import { registerReservationNotificationRoutes } from "./routes/reservation-notifications.js";
import { registerOrderRoutes } from "./routes/orders.js";
import { registerQrMenuRoutes } from "./routes/qr-menu.js";
import { registerDigitalBillRoutes } from "./routes/digital-bill.js";
import { registerOrderTrackingRoutes } from "./routes/order-tracking.js";
import { registerMenuRecommendationRoutes } from "./routes/menu-recommendations.js";
import { registerSpecialRequestRoutes } from "./routes/special-requests.js";
import { registerStationRoutes } from "./routes/stations.js";
import { registerKitchenCommandRoutes } from "./routes/kitchen-commands.js";
import { registerProductionQueueRoutes } from "./routes/production-queue.js";
import { registerKitchenAlertRoutes } from "./routes/kitchen-alerts.js";
import { registerWorkforceRoutes } from "./routes/workforce.js";
import { registerBreakRoutes } from "./routes/breaks.js";
import { registerCashRegisterRoutes } from "./routes/cash-registers.js";
import { registerInvoiceRoutes } from "./routes/invoices.js";
import { registerTaxRateRoutes } from "./routes/tax-rates.js";
import { registerFiscalPrinterRoutes } from "./routes/fiscal-printers.js";
import { registerInvoiceTemplateRoutes } from "./routes/invoice-templates.js";
import { registerMutationAudit } from "./http/mutation-audit.js";

// SPEC-211 — app.ts instantiates and wires plugins/routes without listen().
// server.ts (local/process) and api/serverless.ts (Vercel) both consume this.
export async function buildApp(container?: Container): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 1_048_576,
    trustProxy: resolveTrustProxy(),
    requestTimeout: 30_000,
    connectionTimeout: 10_000,
  });
  const resolvedContainer = container ?? (await buildContainer());
  registerMutationAudit(app, resolvedContainer);

  await app.register(helmet, {
    // Swagger UI needs inline assets. Product frontends define their CSP at
    // their own delivery boundary; all other API security headers remain on.
    contentSecurityPolicy: false,
  });
  const rateLimitOptions = {
    global: true,
    // Tests inject their container and may execute hundreds of requests in a
    // single process; production composition keeps the defensive default.
    max: container || process.env["APP_ENV"] === "test" ? 10_000 : 300,
    timeWindow: "1 minute",
    ...(process.env["APP_ENV"] === "e2e" ? { allowList: ["127.0.0.1"] } : {}),
  };
  await app.register(rateLimit, rateLimitOptions);

  await app.register(cors, {
    origin: resolveCorsOrigins(),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id", "X-Branch-Id"],
    exposedHeaders: ["Content-Disposition", "ETag"],
    credentials: false,
    maxAge: 600,
  });

  // API documentation — most routes validate with a manual Zod .parse() inside
  // the handler rather than a Fastify route `schema`, so this generates a
  // real, browsable endpoint catalog (path/method per route) without detailed
  // per-route request/response bodies. Served at /docs, separate from /v1/*.
  await app.register(swagger, {
    openapi: {
      info: { title: "Maitre API", version: "0.0.1" },
      servers: [{ url: "/" }],
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await registerHealthRoutes(app, resolvedContainer);
  await registerMeRoutes(app, resolvedContainer);
  await registerTenantRoutes(app, resolvedContainer);
  await registerBrandRoutes(app, resolvedContainer);
  await registerBrandPresentationRoutes(app, resolvedContainer);
  await registerFiscalEntityRoutes(app, resolvedContainer);
  await registerBranchRoutes(app, resolvedContainer);
  await registerSalonRoutes(app, resolvedContainer);
  await registerTableRoutes(app, resolvedContainer);
  await registerUserRoutes(app, resolvedContainer);
  await registerRoleRoutes(app, resolvedContainer);
  await registerSubscriptionRoutes(app, resolvedContainer);
  await registerEntitlementRoutes(app, resolvedContainer);
  await registerMenuRoutes(app, resolvedContainer);
  await registerCategoryRoutes(app, resolvedContainer);
  await registerProductRoutes(app, resolvedContainer);
  await registerAuditLogRoutes(app, resolvedContainer);
  await registerDashboardRoutes(app, resolvedContainer);
  await registerVisitRoutes(app, resolvedContainer);
  await registerOccupancyRoutes(app, resolvedContainer);
  await registerTableStatusRoutes(app, resolvedContainer);
  await registerCheckRoutes(app, resolvedContainer);
  await registerPaymentRoutes(app, resolvedContainer);
  await registerServicePeriodRoutes(app, resolvedContainer);
  await registerReservationRoutes(app, resolvedContainer);
  await registerCustomerReservationRoutes(app, resolvedContainer);
  await registerGuestRoutes(app, resolvedContainer);
  await registerWaitlistRoutes(app, resolvedContainer);
  await registerAvailabilityRoutes(app, resolvedContainer);
  await registerReservationNotificationRoutes(app, resolvedContainer);
  await registerOrderRoutes(app, resolvedContainer);
  await registerQrMenuRoutes(app, resolvedContainer);
  await registerDigitalBillRoutes(app, resolvedContainer);
  await registerOrderTrackingRoutes(app, resolvedContainer);
  await registerMenuRecommendationRoutes(app, resolvedContainer);
  await registerSpecialRequestRoutes(app, resolvedContainer);
  await registerStationRoutes(app, resolvedContainer);
  await registerKitchenCommandRoutes(app, resolvedContainer);
  await registerProductionQueueRoutes(app, resolvedContainer);
  await registerKitchenAlertRoutes(app, resolvedContainer);
  await registerWorkforceRoutes(app, resolvedContainer);
  await registerBreakRoutes(app, resolvedContainer);
  await registerCashRegisterRoutes(app, resolvedContainer);
  await registerInvoiceRoutes(app, resolvedContainer);
  await registerTaxRateRoutes(app, resolvedContainer);
  await registerFiscalPrinterRoutes(app, resolvedContainer);
  await registerInvoiceTemplateRoutes(app, resolvedContainer);

  return app;
}

function resolveCorsOrigins(): true | string[] {
  const configured = process.env["CORS_ALLOWED_ORIGINS"]
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (configured?.length) return configured;
  if (process.env["APP_ENV"] === "production") {
    throw new Error("CORS_ALLOWED_ORIGINS must be configured in production");
  }
  return true;
}

function resolveTrustProxy(): boolean | number {
  if (process.env["TRUST_PROXY"] !== "true") return false;
  const hops = Number(process.env["TRUST_PROXY_HOPS"] ?? "1");
  if (!Number.isInteger(hops) || hops < 1) {
    throw new Error("TRUST_PROXY_HOPS must be a positive integer");
  }
  return hops;
}
