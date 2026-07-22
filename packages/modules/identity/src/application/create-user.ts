import { randomUUID } from "node:crypto";
import type { User } from "../domain/user.js";
import type { UserRepositoryPort } from "./ports.js";

export interface CreateUserInput {
  displayName: string;
  email?: string;
  identityProvider?: string;
  externalIdentityId?: string;
  actorId?: string;
  id?: string;
}

export interface CreateUserDeps {
  users: UserRepositoryPort;
  now?: () => Date;
}

/**
 * Creates a placeholder global User for an invited person who hasn't
 * authenticated yet. identityProvider/externalIdentityId default to an
 * opaque "pending-invite" pair (unique per invite) since the real
 * (provider, subject) pair is only known once they accept and sign in —
 * linking that real identity to this placeholder is a future acceptance
 * flow, out of scope for I0 (SPEC-017 §Provisioning).
 */
export async function createUser(
  deps: CreateUserDeps,
  input: CreateUserInput,
): Promise<User> {
  const now = (deps.now ?? (() => new Date()))();
  const user: User = {
    id: input.id ?? randomUUID(),
    identityProvider: input.identityProvider ?? "pending-invite",
    externalIdentityId: input.externalIdentityId ?? randomUUID(),
    displayName: input.displayName,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };
  await deps.users.save(user);
  return user;
}
