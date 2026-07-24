# Verificación — SPEC-111

## Criterios

### CAD-111-01 — Shift pertenece a un Tenant y Branch con timezone y business date inequívocos

- [ ] tenant, branch, timezone y business date inválidos se rechazan;
- [ ] los bordes temporales son inequívocos;
- [ ] los dispositivos cliente no redefinen la autoridad temporal.

### CAD-111-02 — El lifecycle del Shift distingue planificación, apertura, cierre y cancelación

- [ ] la matriz de estados/transiciones se cumple;
- [ ] cierre o cancelación inválidos fallan;
- [ ] no existe cierre implícito por ausencia de eventos.

### CAD-111-03 — El Shift no reemplaza payroll, HR ni identidad laboral global

- [ ] el agregado no contiene payroll ni HR;
- [ ] la identidad global del trabajador permanece fuera del Shift;
- [ ] sólo se modela la ventana operativa aprobada.

### CAD-111-04 — El cierre del Shift valida dependencias operativas aprobadas sin alterar sus autoridades

- [ ] dependencias pendientes bloquean o degradan el cierre según policy;
- [ ] el cierre no altera autoridades ajenas;
- [ ] la evidencia operativa se conserva.

### CAD-111-05 — La concurrencia sobre open/close/cancel usa revisiones explícitas e idempotencia

- [ ] retries no duplican Shift ni cierran dos veces;
- [ ] revisiones stale fallan de forma explícita;
- [ ] no quedan dos shifts activos incompatibles.

### CAD-111-06 — Timezone, DST, auditoría e isolation de Shift quedan cubiertos por evidencia verificable

- [ ] DST y business date poseen fixtures deterministas;
- [ ] auditoría registra open/close/cancel;
- [ ] tenant/branch isolation se verifica sin fugas.
