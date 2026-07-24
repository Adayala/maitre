import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { buildContainer, type Container } from "./composition/container.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerMeRoutes } from "./routes/me.js";
import { registerTenantRoutes } from "./routes/tenants.js";
import { registerBrandRoutes } from "./routes/brands.js";
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

// SPEC-211 — app.ts instantiates and wires plugins/routes without listen().
// server.ts (local/process) and api/serverless.ts (Vercel) both consume this.
export async function buildApp(container?: Container): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  const resolvedContainer = container ?? (await buildContainer());

  // SPEC-210 topology: browser -> Maitre API. The browser sends only a
  // bearer token (no cookies), so an open CORS policy here doesn't grant
  // cross-origin credential access — it just lets apps/web (or any other
  // client) call this API from a different origin during local dev.
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id", "X-Branch-Id"],
  });

  await registerHealthRoutes(app, resolvedContainer);
  await registerMeRoutes(app, resolvedContainer);
  await registerTenantRoutes(app, resolvedContainer);
  await registerBrandRoutes(app, resolvedContainer);
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

  return app;
}
