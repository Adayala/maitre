# Reglas — SPEC-219

## Invariantes

1. Autenticación nunca sustituye autorización.
2. Tenant, branch, role y entitlement se validan server-side.
3. Todo acceso operacional está tenant-scoped y posee tests cross-tenant.
4. Secret/service-role keys, secretos y certificados nunca llegan al navegador.
5. Datos sensibles tienen propósito, owner, acceso y retención explícitos.
6. Passwords y datos completos de tarjeta no se almacenan en Maitre.
7. Inputs externos se validan; outputs se codifican para su contexto.
8. Seguridad no depende de ocultar IDs, rutas o código cliente.
9. Controles fallan cerrados ante estado ambiguo.
10. Dependencias y workflows CI siguen mínimo privilegio y versiones controladas.
11. Hallazgos/excepciones tienen owner y vencimiento; no se silencian.
12. No se afirma cumplimiento ASVS o legal sin evidencia y revisión correspondiente.
13. I0 usa datos sintéticos y no habilita uploads, Storage, webhooks, pagos o ARCA.
14. El runtime I0 no requiere secret/service-role key.
15. CSP/CORS/headers se verifican sobre el deployment real, no sólo en configuración.
16. Si cambia el transporte bearer a cookies, CSRF vuelve a `IN_REVIEW` antes de implementar.
17. Rate limiting no se simula con memoria local como control distribuido serverless.
18. Un proyecto conectado o un token válido nunca reemplaza pruebas de autorización Tenant A/B.

## Gate de datos reales

Antes de datos reales deben completarse threat model, matriz de datos, requisitos ASVS aplicables, pruebas tenant/auth, backup/restore, respuesta a incidentes y revisión legal/contractual pertinente.
