import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from "jose";
import type { AuthenticatedPrincipal, SessionVerificationPort } from "@maitre/identity";

export class InvalidTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTokenError";
  }
}

export class ExpiredTokenError extends Error {
  constructor() {
    super("session-expired");
    this.name = "ExpiredTokenError";
  }
}

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  user_metadata?: { email_verified?: boolean };
  iat: number;
  exp: number;
}

// SPEC-023 §4 — validates signature via JWKS, an explicit algorithm
// allowlist (never chosen from the token header alone), iss/aud/exp, and
// fails closed on any issue. Never logs the token itself.
export class SupabaseSessionVerificationPort implements SessionVerificationPort {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly clockTolerance: number;

  constructor(supabaseUrl: string, options: { audience?: string; clockToleranceSeconds?: number } = {}) {
    const baseUrl = supabaseUrl.replace(/\/$/, "");
    this.issuer = `${baseUrl}/auth/v1`;
    this.audience = options.audience ?? "authenticated";
    this.jwks = createRemoteJWKSet(new URL(`${baseUrl}/auth/v1/.well-known/jwks.json`));
    this.clockTolerance = options.clockToleranceSeconds ?? 5;
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedPrincipal> {
    let payload: SupabaseJwtPayload;
    try {
      const result = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ["ES256"],
        clockTolerance: this.clockTolerance,
      });
      payload = result.payload as unknown as SupabaseJwtPayload;
    } catch (err) {
      if (err instanceof joseErrors.JWTExpired) {
        throw new ExpiredTokenError();
      }
      throw new InvalidTokenError(
        err instanceof Error ? err.name : "token verification failed",
      );
    }

    if (!payload.sub) {
      throw new InvalidTokenError("missing subject claim");
    }

    return {
      provider: "supabase",
      subject: payload.sub,
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.user_metadata?.email_verified !== undefined
        ? { emailVerified: payload.user_metadata.email_verified }
        : {}),
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
    };
  }
}
