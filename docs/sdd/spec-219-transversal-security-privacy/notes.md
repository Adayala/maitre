# Decisiones y fuentes — SPEC-219

## Decisiones

- ASVS 5.0.0 L2 es un objetivo verificable adecuado al tipo de datos; no se declara conformidad hasta reunir evidencia completa.
- OWASP Top 10:2025 guía awareness y threat discovery, pero no alcanza como checklist de seguridad.
- Defense in depth de tenancy combina contexto de aplicación, repositorios, SQL/RLS y pruebas.
- Cifrado de campo se decide por amenaza y custodia de claves; cifrar sin un modelo de claves no reduce todos los riesgos.
- El MVP usa herramientas open source/free disponibles, pero los gates no se relajan por ausencia de SaaS.
- La verificación oficial del 2026-07-21 confirma ASVS 5.0.0 como versión estable y OWASP Top 10:2025 como edición vigente.
- El threat model I0 es deliberadamente pequeño; cada feature fiscal, monetaria, pública o de archivos lo amplía antes de implementación.

## Fuentes

- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/)

## Requiere revisión especializada

- Aplicabilidad y obligaciones de protección de datos personales en Argentina.
- Conservación fiscal, laboral y contractual.
- Alcance PCI y arquitectura del proveedor de pagos.
- Custodia/delegación de certificados ARCA.
- Términos, DPA, subprocesadores y residencia de datos de proveedores.
- Obligaciones de notificación ante incidentes.
