---
schema: "agora/work/v1"
id: "gh-115"
swarm: "fixes-cycle-2"
title: "DASH-011: El nombre del hu\u00e9sped no se persiste"
state: "completed"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"guest-data":"La reserva persiste y muestra nombre, email y tel\u00e9fono ingresados, nunca la identidad de sesi\u00f3n.","checklist":"El checklist reconoce al hu\u00e9sped identificado.","tenant-safety":"Datos y autorizaci\u00f3n permanecen aislados por tenant y sucursal.","tests":"Cobertura unitaria 100% y Playwright Host completo para el comportamiento modificado."}
satisfied-criteria: ["guest-data","checklist","tenant-safety","tests"]
criterion-statuses: {"guest-data":["specified","planned","implemented","verified","accepted"],"checklist":["specified","planned","implemented","verified","accepted"],"tenant-safety":["specified","planned","implemented","verified","accepted"],"tests":["specified","planned","implemented","verified","accepted"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-011: El nombre del huésped no se persiste

## Description

Corregir el mapeo y persistencia del huésped en reservas Host.

## Acceptance criteria

- [x] **guest-data:** La reserva persiste y muestra nombre, email y teléfono ingresados, nunca la identidad de sesión.; stages: specified, planned, implemented, verified, accepted
- [x] **checklist:** El checklist reconoce al huésped identificado.; stages: specified, planned, implemented, verified, accepted
- [x] **tenant-safety:** Datos y autorización permanecen aislados por tenant y sucursal.; stages: specified, planned, implemented, verified, accepted
- [x] **tests:** Cobertura unitaria 100% y Playwright Host completo para el comportamiento modificado.; stages: specified, planned, implemented, verified, accepted

## Required artifacts

- none
