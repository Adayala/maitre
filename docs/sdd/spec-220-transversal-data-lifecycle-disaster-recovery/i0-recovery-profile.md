# Perfil de recuperación I0 — SPEC-220

## Estado

| Capacidad | Estado I0 |
| --- | --- |
| rebuild schema desde migraciones | REQUIRED, pendiente implementación |
| seed sintético idempotente | REQUIRED, pendiente implementación |
| recreación Auth sintética | REQUIRED, pendiente implementación |
| dump/restore portable | NOT_RUN — SPK-06 |
| backup programado | NOT_CONFIGURED |
| destino durable externo | NOT_SELECTED |
| Storage/product objects | DISABLED |
| RPO/RTO aprobados | NOT_APPROVED |
| datos no regenerables/reales | PROHIBITED |

## Fuentes de rebuild

| Activo | Fuente | Verificación |
| --- | --- | --- |
| código/toolchain | Git + lockfile | `npm ci`, gates y build |
| schema/grants/RLS | migraciones SQL Git | base vacía + drift/integridad |
| Tenant/User/Membership/Branch demo | seed/script versionado | IDs/relaciones deterministas e idempotencia |
| Supabase Auth sintético | script administrativo autorizado | User mapping y login; sin secrets en Git |
| configuración | schema/inventario SPEC-214 | reinyección manual/plataforma + readiness |
| secrets | emisor/plataforma | reemisión/rotación, nunca Git |
| UI/API artifacts | build desde commit | checksum/commit y smoke test |

Git y seed recuperan estado esperado sintético. No recuperan modificaciones manuales; I0 prohíbe depender de ellas.

## Experimento SPK-06

1. Crear datos sintéticos Tenant A/B mediante migraciones/seed.
2. Generar dump lógico con credencial temporal/dedicada.
3. Cifrar antes de moverlo; producir manifest y hash.
4. Restaurar en PostgreSQL limpio compatible, sin egress a proveedores.
5. Verificar migraciones, constraints, grants, RLS, conteos y Tenant A/B.
6. Recrear Auth sintético y verificar `/v1/me/context`.
7. Ejecutar smoke/E2E del walking skeleton.
8. Medir pérdida y duración observadas.
9. Eliminar dump, plaintext intermedio, key temporal y destino de restore.
10. Registrar resultado/limitaciones/cleanup en `SPEC-226/evidence/SPK-06.md`.

## Manifest mínimo

```json
{
  "formatVersion": 1,
  "environment": "development",
  "createdAt": "RFC3339 UTC",
  "source": "synthetic-spike",
  "databaseEngine": "PostgreSQL",
  "tool": "pg_dump",
  "toolVersion": "recorded-at-runtime",
  "schemaRevision": "migration identifier",
  "commit": "git SHA",
  "encryptedArtifact": "opaque filename",
  "sizeBytes": 0,
  "sha256": "hex digest",
  "containsRealData": false
}
```

El manifest no contiene host, username, project ref, bucket path privado, connection string o key ID sensible.

## Checks post-restore I0

- migraciones aplicadas coinciden con Git;
- constraints y RLS habilitadas según SPK-04;
- User/Membership/Tenant/Branch poseen conteos/relaciones esperados;
- Tenant A no accede a Tenant B;
- identidad externa se vincula al User correcto;
- `/health/ready` y `/v1/me/context` pasan;
- logs/artifacts no contienen canarios secretos;
- cleanup queda confirmado explícitamente.

## Gate de datos no regenerables

Antes del primer dato no regenerable se requiere:

- destino cifrado fuera del failure domain;
- owner/reviewer y acceso de recuperación;
- key management/rotación;
- frecuencia/retención y RPO/RTO aprobados;
- backup automático y alerta de gap;
- restore probado conservando una copia válida;
- clasificación, borrado/tombstones y revisión legal aplicable;
- presupuesto/plataforma autorizados para el uso previsto.
