import { z } from "zod";

// SPEC-018 — Role Entity (predefined, read-only via API — SPEC-022)
export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  permissions: z.array(z.string().min(1)),
});
export type Role = z.infer<typeof roleSchema>;
