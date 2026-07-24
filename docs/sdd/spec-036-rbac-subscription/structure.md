# Structure — SPEC-036

Middleware checks:
1. Authenticated
2. Resolver contexto Tenant y Membership ACTIVE server-side
3. Resolver permission, scope y authorization version
4. Separar tenant boundary de control-plane `platform.*`
5. Aplicar rule/policy de Subscription/Entitlement/Quota
6. Auditar decisión sensible

Un selector/header no prueba pertenencia. Middleware orquesta; capability/policy vive en
aplicación/dominio.
