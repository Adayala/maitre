# Estructura — SPEC-026

Controles del middleware:
1. Authenticated
2. Resolver tenant solicitado y Membership ACTIVE server-side
3. Resolver permisos efectivos y authorization version
4. Validar alcance por sucursal, delegation policy y regla de dominio
5. Auditar allow/deny sensible

Un header/path sólo solicita contexto; no prueba pertenencia. El middleware orquesta la decisión,
pero permisos/alcances y reglas viven en aplicación/dominio.
