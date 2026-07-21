# Notas — SPEC-003

## Asunciones
- CUIT formato: XX-XXXXXXXX-X (11 dígitos)
- Certificados son X.509 PEM format
- Private keys almacenados en KMS (no en BD)
- Validez de certificado se valida en carga

## Riesgos
| Riesgo | Prob | Impacto | Mitigación |
| --- | --- | --- | --- |
| KMS key rotation | Media | Alto | Plan rotación de keys |
| Certificate expiration missed | Baja | Alto | Alerts cuando valid_to < 30 días |
| CUIT checksum error | Baja | Medio | Use standard CUIT algorithm |

## Decisiones de diseño
### Separate certificate table
**Decisión:** Histórico de certificados en tabla separada
**Por qué:** Auditoría, renovación sin pérdida de datos

### KMS for private keys
**Decisión:** Almacenar clave privada en KMS, no en BD
**Por qué:** Seguridad, compliance

## Status
DRAFT (completado, awaiting peer review)
