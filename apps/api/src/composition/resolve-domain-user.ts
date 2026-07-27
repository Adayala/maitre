import { createUser, type AuthenticatedPrincipal, type Membership, type User } from "@maitre/identity";
import type { Container } from "./container.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function activateInvitedMemberships(
  container: Container,
  memberships: Membership[],
  now: Date,
): Promise<void> {
  for (const membership of memberships) {
    if (membership.status !== "INVITED") continue;
    await container.memberships.save({
      ...membership,
      status: "ACTIVE",
      activatedAt: membership.activatedAt ?? now,
      updatedAt: now,
    });
  }
}

async function claimPendingInviteByEmail(
  container: Container,
  principal: AuthenticatedPrincipal,
): Promise<User | null> {
  if (principal.provider !== "supabase" || !principal.email) return null;

  const invitedUser = await container.users.findByEmail(normalizeEmail(principal.email));
  if (!invitedUser || invitedUser.identityProvider !== "pending-invite") return null;

  const now = new Date();
  const claimedUser: User = {
    ...invitedUser,
    identityProvider: principal.provider,
    externalIdentityId: principal.subject,
    email: normalizeEmail(principal.email),
    updatedAt: now,
  };
  await container.users.save(claimedUser);

  const memberships = await container.memberships.listByUser(invitedUser.id);
  await activateInvitedMemberships(container, memberships, now);
  return claimedUser;
}

async function provisionSupabaseUser(
  container: Container,
  principal: AuthenticatedPrincipal,
): Promise<User | null> {
  if (principal.provider !== "supabase") return null;
  const email = principal.email ? normalizeEmail(principal.email) : undefined;
  return createUser(
    { users: container.users },
    {
      displayName: email ?? `supabase:${principal.subject}`,
      identityProvider: principal.provider,
      externalIdentityId: principal.subject,
      ...(email ? { email } : {}),
    },
  );
}

export async function resolveDomainUser(
  container: Container,
  principal: AuthenticatedPrincipal,
): Promise<User | null> {
  const exact = await container.users.findByExternalIdentity(principal.provider, principal.subject);
  if (exact) return exact;
  const claimed = await claimPendingInviteByEmail(container, principal);
  if (claimed) return claimed;
  return provisionSupabaseUser(container, principal);
}
