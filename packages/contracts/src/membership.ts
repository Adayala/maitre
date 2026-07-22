import { z } from "zod";

// SPEC-020 — Membership Entity
export const membershipStatusSchema = z.enum([
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
]);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

export const branchScopeTypeSchema = z.enum(["ALL_BRANCHES", "SELECTED_BRANCHES"]);
export type BranchScopeType = z.infer<typeof branchScopeTypeSchema>;

export const membershipSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  status: membershipStatusSchema,
  branchScopeType: branchScopeTypeSchema,
  roleIds: z.array(z.string()),
  branchIds: z.array(z.string().uuid()),
  invitedAt: z.coerce.date().nullable().optional(),
  activatedAt: z.coerce.date().nullable().optional(),
  suspendedAt: z.coerce.date().nullable().optional(),
  revokedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().nullable().optional(),
  updatedAt: z.coerce.date(),
  updatedBy: z.string().uuid().nullable().optional(),
}).superRefine((membership, ctx) => {
  if (
    membership.branchScopeType === "SELECTED_BRANCHES" &&
    membership.branchIds.length === 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SELECTED_BRANCHES requires at least one branch id",
      path: ["branchIds"],
    });
  }
  if (membership.status === "ACTIVE" && membership.roleIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "ACTIVE membership requires at least one role",
      path: ["roleIds"],
    });
  }
});
export type Membership = z.infer<typeof membershipSchema>;
