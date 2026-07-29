import { z } from "zod";

// SPEC-027 — Subscription Entity
export const subscriptionStatusSchema = z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED"]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const billingCycleSchema = z.enum(["MONTHLY", "ANNUALLY"]);
export type BillingCycle = z.infer<typeof billingCycleSchema>;

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  subscriberFiscalEntityId: z.string().uuid().optional(),
  planCode: z.string().min(1),
  status: subscriptionStatusSchema,
  billingCycle: billingCycleSchema,
  startDate: z.coerce.date(),
  renewalDate: z.coerce.date(),
  cancellationDate: z.coerce.date().nullable().optional(),
  currentPeriodStart: z.coerce.date(),
  currentPeriodEnd: z.coerce.date(),
  autoRenew: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

// SPEC-028 — SubscriptionItem Entity
export const subscriptionItemStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const subscriptionItemSchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  serviceId: z.string().min(1),
  status: subscriptionItemStatusSchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  activatedAt: z.coerce.date(),
  deactivatedAt: z.coerce.date().nullable().optional(),
});
export type SubscriptionItem = z.infer<typeof subscriptionItemSchema>;

// SPEC-029 — Entitlement Entity
export const entitlementResourceSchema = z.enum([
  "branches",
  "users",
  "orders",
  "api_calls",
  "storage",
]);

export const entitlementSchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  resource: entitlementResourceSchema,
  softLimit: z.number().int().nullable().optional(),
  hardLimit: z.number().int(),
  overrideReason: z.string().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});
export type Entitlement = z.infer<typeof entitlementSchema>;

// SPEC-030 — Quota Entity
export const quotaSchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  resource: z.string().min(1),
  used: z.number().int().nonnegative(),
  entitlementId: z.string().uuid(),
  lastUpdatedAt: z.coerce.date(),
});
export type Quota = z.infer<typeof quotaSchema>;
