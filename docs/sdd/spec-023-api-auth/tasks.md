# Tasks — SPEC-023

- [ ] Registrar ADR del proveedor y estrategia de sesión elegida.
- [ ] Ejecutar spike real de token/JWKS y documentar issuer, audience y rotación.
- [ ] Definir `AuthenticatedPrincipal` y `SessionVerificationPort`.
- [ ] Implementar middleware fail-closed y Problem Details.
- [ ] Implementar adaptador Supabase fuera de application/domain.
- [ ] Integrar login, refresh, logout, reset y verify en React.
- [ ] Definir allowlist de redirects por ambiente.
- [ ] Vincular identidad externa a User mediante flujo autorizado e idempotente.
- [ ] Resolver Membership, roles y branch scopes desde persistencia Maitre.
- [ ] Implementar `GET /v1/me/context` conforme SPEC-213.
- [ ] Añadir suite negativa de tokens y aislamiento Tenant A/B.
- [ ] Auditar logs, traces, sourcemaps y bundle del browser para secretos.
- [ ] Publicar evidencia en `verification.md` antes de cambiar el status.
- [x] Añadir inicio/registro con Google al cliente React mediante el SDK de Supabase.
- [ ] Habilitar Google y registrar redirects exactos en cada proyecto Supabase.
