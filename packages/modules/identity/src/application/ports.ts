import type { User } from "../domain/user.js";
import type { Membership } from "../domain/membership.js";

// SPEC-023 — verified token identity, not authorization.
export interface AuthenticatedPrincipal {
  provider: string;
  subject: string;
  email?: string;
  emailVerified?: boolean;
  issuedAt: Date;
  expiresAt: Date;
}

export interface SessionVerificationPort {
  verifyAccessToken(token: string): Promise<AuthenticatedPrincipal>;
}

export interface UserRepositoryPort {
  findByExternalIdentity(provider: string, subject: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface MembershipRepositoryPort {
  listActiveByUser(userId: string): Promise<Membership[]>;
  findActiveByUserAndTenant(userId: string, tenantId: string): Promise<Membership | null>;
  save(membership: Membership): Promise<void>;
}
