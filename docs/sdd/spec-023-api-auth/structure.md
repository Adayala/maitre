# Structure — SPEC-023

## Capas propuestas

```text
apps/web
  auth/provider-client.ts
  auth/session-store.ts

apps/api
  presentation/http/authenticate-request.ts
  application/ports/session-verification.port.ts
  application/queries/get-my-context.ts
  infrastructure/auth/supabase-session-verifier.ts
  infrastructure/auth/jwks-cache.ts
```

Los nombres son orientativos; la dependencia es obligatoria:

```text
HTTP middleware
  -> SessionVerificationPort
     <- Supabase/JWKS adapter
  -> UserRepository + MembershipRepository
  -> autorización de dominio
```

## Configuración server-side

- issuer esperado;
- audience esperada;
- URL JWKS confiable;
- algoritmos permitidos;
- clock skew y TTL de cache;
- identificador estable del proveedor.

Los secretos sólo se leen en infraestructura y se validan al iniciar. Ninguna service-role key se incluye en bundles `VITE_*`.
