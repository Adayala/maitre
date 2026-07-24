# Objetivo — SPEC-003

## Propósito

Definir FiscalEntity como agregado fiscal con alcance tenant responsable de emitir comprobantes, con identidad tributaria verificable, puntos de venta relacionados y material criptográfico gobernado sin exponer secretos en el dominio operativo.

## Resultado esperado

1. FiscalEntity pertenece exactamente a un tenant y usa CUIT único dentro de ese tenant.
2. La condición tributaria y el ciclo de vida fiscal quedan explícitos.
3. Certificados y claves se referencian con gobierno seguro, sin exponer secretos en texto plano.
4. Los puntos de venta se modelan como recursos relacionados, no como números sueltos sin trazabilidad.
5. Branch sólo puede usar FiscalEntities del mismo Tenant.
6. Mutaciones fiscales quedan auditadas y protegidas por aislamiento y controles de seguridad.

## Fuera de alcance I0

- facturación electrónica end-to-end contra ARCA;
- almacenar claves privadas en texto plano en la base operativa;
- resolver puntos de venta como campos libres embebidos sin agregado asociado;
- CRUD HTTP, definido por su spec API;
- automatizar renovación de certificados sin workflow aprobado.

## Criterios de aceptación

### CAD-003-01 — FiscalEntity modela identidad fiscal tenant-scoped

FiscalEntity expone `id`, `tenantId`, `cuit`, `legalName`, `taxCondition`, `status` y metadatos de contacto o identificación aprobados. No existe fuera de un tenant ni comparte identidad fiscal implícita con otras entidades.

### CAD-003-02 — CUIT y condición tributaria son válidos y consistentes

`cuit` se valida sintáctica y semánticamente, incluida verificación de checksum. La condición tributaria pertenece a un catálogo aprobado y no admite strings arbitrarios fuera del contrato.

### CAD-003-03 — El material criptográfico se gobierna sin exponer secretos

Certificados, claves o referencias de firma se almacenan mediante referencias seguras o almacenes aprobados. El agregado sólo conserva metadatos necesarios para ciclo de vida, vigencia y auditoría.

### CAD-003-04 — Los puntos de venta se relacionan con trazabilidad explícita

La entidad puede asociarse a uno o más puntos de venta aprobados, con numeración única según reglas fiscales aplicables y lifecycle independiente cuando corresponda.

### CAD-003-05 — FiscalEntity sólo puede ser usada dentro del mismo Tenant

Branch, comprobantes y recursos dependientes sólo pueden referenciar FiscalEntities del mismo tenant. El acceso cross-tenant falla en aplicación y en persistencia cuando existan constraints compuestas.

### CAD-003-06 — Mutaciones fiscales preservan auditoría, lifecycle y aislamiento

Cambios en estado fiscal, certificados o asociaciones relevantes quedan auditados, aplican control de concurrencia y nunca filtran secretos, PII innecesaria ni datos de otro tenant.
