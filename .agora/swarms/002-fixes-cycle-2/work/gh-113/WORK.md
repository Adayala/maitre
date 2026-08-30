---
schema: "agora/work/v1"
id: "gh-113"
swarm: "fixes-cycle-2"
title: "DASH-009: Error API sin traducir al confirmar reserva"
state: "completed"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"message":"El conflicto explica en espa\u00f1ol la causa y acci\u00f3n correctiva.","mapping":"Errores esperados se mapean por c\u00f3digo estable, sin filtrar mensajes crudos.","tests":"Cobertura unitaria 100% y Playwright Host del error 409."}
satisfied-criteria: ["message","mapping","tests"]
criterion-statuses: {"message":["specified","planned","implemented","verified","accepted"],"mapping":["specified","planned","implemented","verified","accepted"],"tests":["specified","planned","implemented","verified","accepted"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-009: Error API sin traducir al confirmar reserva

## Description

Traducir y contextualizar conflictos de confirmación.

## Acceptance criteria

- [x] **message:** El conflicto explica en español la causa y acción correctiva.; stages: specified, planned, implemented, verified, accepted
- [x] **mapping:** Errores esperados se mapean por código estable, sin filtrar mensajes crudos.; stages: specified, planned, implemented, verified, accepted
- [x] **tests:** Cobertura unitaria 100% y Playwright Host del error 409.; stages: specified, planned, implemented, verified, accepted

## Required artifacts

- none
