import { createRemoteJWKSet, decodeJwt, jwtVerify, errors as joseErrors } from "jose";
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
  aud: string;
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
  private readonly apiKey: string | undefined;

  constructor(supabaseUrl: string, options: { audience?: string; clockToleranceSeconds?: number; apiKey?: string } = {}) {
    const baseUrl = supabaseUrl.replace(/\/$/, "");
    this.issuer = `${baseUrl}/auth/v1`;
    this.audience = options.audience ?? "authenticated";
    this.jwks = createRemoteJWKSet(new URL(`${baseUrl}/auth/v1/.well-known/jwks.json`));
    this.clockTolerance = options.clockToleranceSeconds ?? 5;
    this.apiKey = options.apiKey;
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedPrincipal> {
    if (this.apiKey) return this.verifyWithAuthApi(token);
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

  private async verifyWithAuthApi(token: string): Promise<AuthenticatedPrincipal> {
    const response = await fetch(`${this.issuer}/user`, {
      headers: { apikey: this.apiKey!, authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new InvalidTokenError(`auth-api-${response.status}`);
    const user = await response.json() as { id?: string; email?: string; user_metadata?: { email_verified?: boolean } };
    const payload = decodeJwt(token) as unknown as SupabaseJwtPayload;
    if (!user.id || payload.sub !== user.id || payload.aud !== this.audience) {
      throw new InvalidTokenError("auth-api-claims-mismatch");
    }
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp + this.clockTolerance < now) throw new ExpiredTokenError();
    return {
      provider: "supabase",
      subject: user.id,
      ...(user.email !== undefined ? { email: user.email } : {}),
      ...(user.user_metadata?.email_verified !== undefined
        ? { emailVerified: user.user_metadata.email_verified }
        : {}),
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
    };
  }
}
