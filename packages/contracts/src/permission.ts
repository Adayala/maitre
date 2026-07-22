import { z } from "zod";

// SPEC-019 — Permission Entity
const permissionIdPattern = /^(\*|[a-z][a-z0-9_]*:(\*|[a-z][a-z0-9_]*))$/;

export const permissionIdSchema = z.string().regex(permissionIdPattern);

export const permissionSchema = z.object({
  id: permissionIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
});
export type Permission = z.infer<typeof permissionSchema>;
