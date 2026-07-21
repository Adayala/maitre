# Plan — SPEC-023

1. Aprobar la decisión de proveedor mediante ADR y completar los spikes de Auth/JWKS de SPEC-226.
2. Definir contratos `AuthenticatedPrincipal`, `SessionVerificationPort` y errores Problem Details.
3. Implementar adaptador Supabase/JWKS con validación estricta y cache controlado.
4. Integrar el cliente React con los flows del proveedor y redirect allowlist.
5. Resolver User y Membership server-side para `GET /v1/me/context`.
6. Añadir tests unitarios, de contrato, integración y aislamiento multi-tenant.
7. Validar logs, bundles y variables de Vercel para evitar filtración de secretos.

La estimación se realizará después del spike; esta spec no fija horas sin evidencia técnica.
