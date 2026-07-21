# Especificación — SPEC-219

## 1. Baseline verificable

Maitre adopta OWASP ASVS 5.0.0 nivel 2 como objetivo para aplicaciones que manejan datos sensibles. Cada requisito aplicable se registra con:

- identificador versionado `v5.0.0-x.y.z`;
- alcance y componentes;
- implementación/control;
- evidencia automatizada o manual;
- estado, owner y excepción si corresponde.

OWASP Top 10:2025 se usa para concientización y cobertura de riesgo, no como sustituto de ASVS o threat modeling.

## 2. Threat modeling

Un modelo por arquitectura/recorrido identifica:

- activos y clasificación de datos;
- actores humanos, dispositivos y sistemas;
- trust boundaries y flujos;
- spoofing, tampering, repudiation, disclosure, denial of service y elevation of privilege;
- abuso de lógica de negocio y fraude;
- mitigaciones, riesgo residual, owner y prueba.

Se actualiza cuando cambia autenticación, tenancy, pagos, fiscalidad, offline, archivos, integraciones, IA o exposición pública. Diagramas y decisiones viven en Git; no incluyen secretos.

## 3. Identidad y sesiones

- Supabase Auth autentica; el dominio autoriza.
- El servidor valida firma, issuer, audience, expiración y algoritmo permitido.
- Access tokens tienen vida acotada; refresh/revocación siguen capacidades verificadas del proveedor.
- Logout revoca o invalida la sesión según riesgo y elimina estado sensible local.
- Cambio de password, rol, membership o incidente invalida acceso efectivo sin esperar indefinidamente al token.
- MFA es obligatorio antes de producción para administradores, fiscalidad, secretos y operaciones de alto impacto cuando el proveedor lo soporte.
- No existen cuentas compartidas para tareas auditables.
- Mensajes de login/reset no permiten enumeración innecesaria de usuarios.

## 4. Autorización y aislamiento multi-tenant

El acceso sigue deny-by-default:

```text
token válido
  → User activo
  → Membership activa
  → tenant/branch dentro del alcance
  → role + permission
  → entitlement
  → regla del recurso
```

- El cliente nunca es fuente de roles o permisos.
- IDs de request se tratan como no confiables.
- Repositorios exigen `TenantContext`; no ofrecen métodos operativos sin tenant.
- Queries filtran tenant explícitamente y RLS aporta defensa en profundidad.
- Service role no llega al browser y su uso queda acotado/auditado.
- Tests generan al menos dos tenants y prueban lectura, escritura, listado, búsqueda, exportación, eventos y storage cross-tenant.
- Errores aplican política 403/404 sin revelar existencia.

## 5. Clasificación y privacidad

| Clase | Ejemplos | Tratamiento inicial |
| --- | --- | --- |
| Pública | menú publicado, datos comerciales elegidos | integridad y cache control |
| Interna | configuración operativa, métricas agregadas | acceso autenticado |
| Confidencial | huéspedes, empleados, reservas, facturas | mínimo privilegio, retención y auditoría |
| Restringida | secretos, tokens, certificados, datos de pago | no log, acceso excepcional, rotación/custodia |

Cada entidad/campo sensible declara propósito, base/justificación, owner, visibilidad, retención, exportación y borrado/anominización. Se recolecta el mínimo necesario y no se reutiliza para analítica o IA sin decisión compatible.

Requisitos legales argentinos y contractuales se mantienen en una matriz separada revisada por asesoría competente; la spec no presume que un control técnico equivale a cumplimiento.

## 6. Protección de datos

- TLS obligatorio en tránsito fuera de local.
- Cifrado at-rest del proveedor se verifica y documenta.
- Cifrado a nivel de campo se decide por threat model, búsqueda y custodia de claves; no se aplica como gesto simbólico.
- Passwords se delegan al proveedor de identidad y nunca llegan a logs o dominio.
- Datos de tarjeta no se almacenan; se usan tokens/referencias del proveedor de pagos.
- Certificados/keys ARCA son restringidos, server-only y con custodia/rotación propia.
- Backups y exports conservan clasificación, cifrado, acceso y expiración.
- Datos de fixtures, demo, capturas y soporte son sintéticos o anonimizados.

## 7. Validación, encoding e inyección

- Toda entrada externa se valida por schema y reglas de dominio.
- SQL usa parámetros/ORM seguro; strings externos no construyen queries, sort u operators.
- React escapa texto por defecto; HTML arbitrario queda prohibido salvo sanitizador revisado y necesidad explícita.
- URLs salientes usan allowlists y resolución segura contra SSRF.
- Redirecciones aceptan destinos internos/permitidos.
- Paths y nombres de archivo no controlan rutas locales.
- Templates, CSV y exports neutralizan fórmulas/inyección según consumidor.
- Errores no reflejan input peligroso sin encoding contextual.

## 8. Browser y API

- CSP restrictiva con nonces/hashes cuando corresponda; evitar `unsafe-inline`/`unsafe-eval`.
- Headers mínimos: HSTS en producción, `nosniff`, política de referrer y permisos, frame protection mediante CSP.
- CORS por allowlist de ambiente.
- CSRF se mitiga según transporte: cookies requieren SameSite, token/origin checks; bearer no se guarda en ubicaciones expuestas innecesariamente.
- Cookies sensibles son Secure, HttpOnly cuando aplica y con scope mínimo.
- Responses sensibles usan cache policy adecuada.
- Rate limiting, body limits y timeouts protegen recursos sin usar IP como única identidad.
- Source maps productivos no se publican abiertamente si revelan implementación sensible.

## 9. Archivos y contenido

- Allowlist de MIME/extensión validada por contenido, no sólo header.
- Tamaño, cantidad y cuota por tenant/usuario.
- Nombres generados; original sólo como metadata sanitizada.
- Buckets privados por defecto y URLs firmadas breves.
- Contenido activo, ejecutable o HTML se rechaza salvo spec específica.
- Descargas fuerzan media type/disposition seguro.
- Malware scanning se incorpora antes de aceptar archivos de riesgo; hasta entonces, ese tipo queda prohibido.

## 10. Supply chain y CI

- Lockfile reproducible y versiones controladas.
- Dependencias nuevas requieren propósito, mantenimiento, licencia, superficie y alternativa.
- Renovate/Dependabot o equivalente crea actualizaciones revisables.
- SCA, secret scan, SAST/Sonar y tests de seguridad ejecutan en CI.
- GitHub Actions se fijan por commit SHA o política equivalente y usan permisos mínimos.
- Builds no ejecutan scripts de dependencias innecesarios con secretos disponibles.
- Artefactos provienen del commit verificado y conservan trazabilidad.
- Vulnerabilidades se priorizan por explotabilidad, exposición e impacto, no sólo score.

## 11. Integraciones y webhooks

- Credenciales por proveedor/ambiente con scopes mínimos.
- OAuth usa state/PKCE donde corresponda y valida redirect URIs.
- Webhooks verifican firma, timestamp/replay window e idempotencia antes de procesar.
- Egress restringe destinos cuando sea viable.
- Timeouts, retries y circuit behavior siguen SPEC-216/217.
- Payloads externos se consideran no confiables aunque la firma sea válida.
- Acciones externas quedan auditadas sin registrar secretos o payloads innecesarios.

## 12. Auditoría y detección

Audit records incluyen actor, acción, recurso, tenant/branch, resultado, timestamp y correlation; son append-only lógico y con acceso restringido.

Se auditan como mínimo:

- login/reset/MFA y cambios de sesión relevantes;
- memberships, roles, permisos y entitlements;
- secretos, integraciones y certificados;
- descuentos, caja, pagos, facturas y ARCA;
- exports, borrado y cambios de retención;
- replay de eventos y acciones administrativas.

Logs técnicos siguen SPEC-216 y no reemplazan auditoría. Señales de abuso producen alertas con runbook.

## 13. Gestión de vulnerabilidades e incidentes

- Findings tienen severidad contextual, owner, SLA interno y evidencia de cierre.
- Una excepción requiere riesgo, compensación, vencimiento y aprobador.
- Secretos expuestos se revocan antes de limpiar referencias.
- Incidentes preservan evidencia, limitan acceso y documentan decisiones.
- Notificación legal/contractual se decide con asesoría y matriz vigente.
- Postmortems producen controles o tests que evitan recurrencia.
