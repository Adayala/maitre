---
schema: "agora/work/v1"
id: "gh-112"
swarm: "fixes-cycle-2"
title: "DASH-008: Reserva en sucursal sin mesas"
state: "verifying"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"validation":"La creaci\u00f3n no confirma una operaci\u00f3n inviable cuando no hay mesas configuradas.","tenant-safety":"La disponibilidad se valida para el tenant y sucursal seleccionados.","tests":"Cobertura unitaria 100% y Playwright Host con/sin mesas."}
satisfied-criteria: []
criterion-statuses: {"validation":["specified","planned","implemented","verified"],"tenant-safety":["specified","planned","implemented","verified"],"tests":["specified","planned","implemented","verified"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-008: Reserva en sucursal sin mesas

## Description

Impedir o advertir antes de crear una reserva sin capacidad real.

## Acceptance criteria

- [ ] **validation:** La creación no confirma una operación inviable cuando no hay mesas configuradas.; stages: specified, planned, implemented, verified
- [ ] **tenant-safety:** La disponibilidad se valida para el tenant y sucursal seleccionados.; stages: specified, planned, implemented, verified
- [ ] **tests:** Cobertura unitaria 100% y Playwright Host con/sin mesas.; stages: specified, planned, implemented, verified

## Required artifacts

- none
