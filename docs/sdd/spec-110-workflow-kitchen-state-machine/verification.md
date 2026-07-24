# Verificación — SPEC-110

## Criterios

### CAD-110-01 — El workflow declara estados y transiciones permitidas de forma explícita y versionada

- [ ] la matriz de estados y transiciones permitidas está cerrada y versionada;
- [ ] estados no aprobados o transiciones inexistentes fallan cerrado;
- [ ] la UI no introduce estados fuera del contrato.

### CAD-110-02 — Las transiciones preservan causalidad por item/ticket y rechazan regresiones inválidas

- [ ] cambios stale o regresivos inválidos fallan;
- [ ] la revisión causal por item/ticket se conserva;
- [ ] los retries no duplican avance de estado.

### CAD-110-03 — Realtime y polling distribuyen hints, pero la autoridad sigue en el workflow persistido

- [ ] hints perdidos o tardíos no degradan la autoridad;
- [ ] polling/refetch recupera gaps;
- [ ] la proyección visible converge con el workflow persistido.

### CAD-110-04 — Las correcciones manuales, force transitions y bloqueos requieren permiso, reason y auditoría

- [ ] force transitions sin permiso o reason fallan;
- [ ] las correcciones manuales quedan auditadas;
- [ ] bloqueos y reopens correctivos siguen workflow explícito.

### CAD-110-05 — El workflow separa preparación, entrega y cierre sin confundirlos con pago o facturación

- [ ] Kitchen no marca pagos ni facturación como completados;
- [ ] los estados culinarios permanecen separados del cierre comercial;
- [ ] integraciones cruzadas no mezclan autoridades.

### CAD-110-06 — Concurrencia, replay, gaps e aislamiento Kitchen quedan cubiertos por evidencia determinista

- [ ] transiciones concurrentes producen outcomes deterministas;
- [ ] replay/gaps quedan cubiertos por fixtures;
- [ ] branch/station/tenant isolation se verifica sin filtraciones.
