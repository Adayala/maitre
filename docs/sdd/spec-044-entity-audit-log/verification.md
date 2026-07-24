# Verificación — SPEC-044

## Criterios

### CAD-044-01 — Cada acción sensible registra actor efectivo, tenant, action/resource, outcome, reason y correlation/causation sin aceptar identidad declarada por el cliente

- [ ] acciones/outcomes sensibles producen record con actor/contexto server-side;
- [ ] actor efectivo, tenant, action/resource y outcome quedan trazados;
- [ ] identidad declarada por el cliente no se acepta como autoridad.

### CAD-044-02 — Records son append-only, secuenciados por partición y enlazan hash previo para detectar alteración, pérdida o reordenamiento

- [ ] alteración, eliminación y reorder rompen chain/gap checks;
- [ ] los records son append-only;
- [ ] secuencia y hash previo permiten detectar pérdida o reordenamiento.

### CAD-044-03 — Before/after son diffs sanitizados por schema; tokens, passwords, secrets, PII completa, IP y user-agent crudos quedan excluidos

- [ ] diff schema redacta secrets/PII/IP/user-agent crudos;
- [ ] before/after se sanitizan por schema;
- [ ] tokens y passwords quedan excluidos.

### CAD-044-04 — Falla de auditoría bloquea cambios financieros, fiscales, permisos, secretos y soporte cross-tenant; degradación de telemetría no crítica es explícita/reconciliable

- [ ] acción crítica falla si no puede auditar;
- [ ] acción no crítica degrada sólo según policy y queda reconciliable;
- [ ] los modos de falla siguen la clasificación contractual.

### CAD-044-05 — Retención, legal hold, export y privacy disposition siguen policy versionada; no existe cleanup default arbitrario

- [ ] retention/legal hold/privacy disposition poseen evidencia;
- [ ] export sigue policy versionada;
- [ ] no existe cleanup arbitrario por defecto.

### CAD-044-06 — Inmutabilidad, redacción, integridad, clocks, partition ordering, failure mode e isolation poseen evidencia contractual

- [ ] clock/sequence/partition son deterministas;
- [ ] inmutabilidad, redacción e integridad poseen evidencia;
- [ ] cross-tenant no escribe/lee otra partición.
