# Verificación — SPEC-036

## Criterios

### CAD-036-01 — Toda decisión resuelve Membership ACTIVE, permiso y alcance; OWNER/ADMIN/MANAGER nominales no reemplazan assignments efectivos

- [ ] lectura/mutación tenant coincide con la matriz de permisos y el alcance;
- [ ] rol nominal sin permiso efectivo queda denegado;
- [ ] las decisiones parten de assignments efectivos.

### CAD-036-02 — Lectura de Subscription, Entitlement y Quota minimiza términos comerciales según permiso y necesidad operativa

- [ ] MANAGER sólo observa capacidad operativa necesaria;
- [ ] la lectura minimiza términos comerciales;
- [ ] la exposición depende de permiso y necesidad operativa.

### CAD-036-03 — `subscription.change.request` permite solicitar cambios permitidos, no provisionar/suspender/cancelar como plataforma ni cobrar

- [ ] la request permite sólo cambios tenant permitidos;
- [ ] no provisiona/suspende/cancela como plataforma;
- [ ] no ejecuta cobros.

### CAD-036-04 — Operaciones `platform.*` requieren control-plane separado, step-up, actor real, tenant objetivo, ticket/reason y segregación

- [ ] provisioning/suspend/cancel sin capability `platform.*` falla;
- [ ] control-plane desde Membership falla;
- [ ] actor real, tenant objetivo y reason quedan auditados.

### CAD-036-05 — Ningún actor escribe Entitlement/Quota derivados; overrides siguen workflow, autoridad, motivo, vigencia y auditoría

- [ ] write directo de Entitlement/Quota falla;
- [ ] override sin autoridad/motivo/vigencia falla;
- [ ] el workflow de override queda auditado.

### CAD-036-06 — Cross-tenant, self-grant, impersonation, permiso desconocido y datos comerciales excesivos poseen outcomes deny-by-default verificables

- [ ] self-grant e impersonation fallan;
- [ ] permiso desconocido falla cerrado;
- [ ] cross-tenant no enumera ni expone términos comerciales.
