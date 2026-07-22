import { z } from "zod";

// SPEC-023 — AuthenticatedPrincipal (verified token, not authorization)
export const authenticatedPrincipalSchema = z.object({
  provider: z.string().min(1),
  subject: z.string().min(1),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  issuedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});
export type AuthenticatedPrincipal = z.infer<typeof authenticatedPrincipalSchema>;

// SPEC-213 — GET /v1/me/context response
export const meContextBranchSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
});

export const meContextTenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  branches: z.array(meContextBranchSchema),
});

export const meContextResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    email: z.string().email().nullable().optional(),
  }),
  tenants: z.array(meContextTenantSchema),
});
export type MeContextResponse = z.infer<typeof meContextResponseSchema>;

// Problem Details error shape (SPEC-023 §7 / SPEC-215)
export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  correlationId: z.string(),
});
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
