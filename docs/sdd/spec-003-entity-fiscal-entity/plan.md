# Plan — SPEC-003

## Componentes

| Componente | Descripción |
| --- | --- |
| FiscalEntity entity | Modelo dominio |
| fiscal_entities table | Persistencia |
| fiscal_certificates table | Histórico certificados |
| POST /fiscal-entities | Crear |
| GET /fiscal-entities/:id | Obtener |
| PATCH /fiscal-entities/:id | Actualizar |
| POST /fiscal-entities/:id/certificates | Cargar certificado |
| API validación CUIT | Checksum validation |
| API validación certificado X.509 | OpenSSL, validación |
| KMS integration | Almacenar clave privada |

## Dependencias

**Must be DONE:** SPEC-001 Tenant ✅

**Depends:** SPEC-004 Branch, SPEC-127 FiscalPoint
