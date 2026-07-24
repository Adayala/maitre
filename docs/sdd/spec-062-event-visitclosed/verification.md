# Verificación — SPEC-062

## Criterios

### CAD-062-01 — VisitClosed representa sólo el cierre consumado de la visita

- [ ] request-close y transiciones inválidas no emiten VisitClosed.

### CAD-062-02 — El cierre publica evento sólo con atomicidad completa

- [ ] blocker/rollback no deja evento ni cierre parcial.

### CAD-062-03 — El payload de cierre es mínimo y libre de PII o importes

- [ ] schema y scanners prueban payload mínimo sin PII/importes.

### CAD-062-04 — La reapertura correctiva queda separada y correlacionada

- [ ] reopen queda correlacionado, revisionado y auditado sin borrar closed.

### CAD-062-05 — El delivery de cierre y reapertura converge por revisión

- [ ] duplicate, reorder, gap y replay convergen por eventId/revision.

### CAD-062-06 — La aprobación exige evidencia de blockers, corrección y compatibilidad

- [ ] registry, compatibilidad, DLQ y routing aislado poseen evidencia.
