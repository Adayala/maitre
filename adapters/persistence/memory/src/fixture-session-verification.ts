import type {
  AuthenticatedPrincipal,
  SessionVerificationPort,
} from "@maitre/identity";

/**
 * Fixture adapter for I0/demo only. SPEC-023 requires the real adapter to
 * validate JWKS signature, issuer, audience and expiry against Supabase Auth
 * (pending SPK-03, SPEC-210/226). Tokens here are opaque ids mapped to
 * synthetic principals — never used against real credentials.
 */
export class FixtureSessionVerificationPort implements SessionVerificationPort {
  private readonly principalsByToken = new Map<string, AuthenticatedPrincipal>();

  registerToken(token: string, principal: AuthenticatedPrincipal): void {
    this.principalsByToken.set(token, principal);
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedPrincipal> {
    const principal = this.principalsByToken.get(token);
    if (!principal) {
      throw new Error("authentication-required");
    }
    if (principal.expiresAt.getTime() <= Date.now()) {
      throw new Error("session-expired");
    }
    return principal;
  }
}
