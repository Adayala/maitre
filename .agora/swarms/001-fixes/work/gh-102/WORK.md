---
schema: "agora/work/v1"
id: "gh-102"
swarm: "fixes"
title: "DASH-001: El panel de detalle no sigue a la selecci\u00f3n del \u00e1rbol"
state: "completed"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"selection-sync":"El panel muestra la entidad seleccionada o se limpia cuando la navegaci\u00f3n cambia de rama.","unsafe-actions":"Guardar y Desactivar nunca act\u00faan sobre una entidad distinta de la selecci\u00f3n visible.","tenant-safety":"La selecci\u00f3n y las operaciones permanecen aisladas por tenant, marca y sucursal.","tests":"Tests unitarios cubren al 100% statements, branches, functions y lines del c\u00f3digo modificado.","e2e":"Playwright cubre recorrido principal, cambio de rama, permisos, estados relevantes, responsive y accesibilidad."}
satisfied-criteria: ["selection-sync","unsafe-actions","tenant-safety","tests","e2e"]
criterion-statuses: {"selection-sync":["specified","planned","implemented","verified","accepted"],"unsafe-actions":["specified","planned","implemented","verified","accepted"],"tenant-safety":["specified","planned","implemented","verified","accepted"],"tests":["specified","planned","implemented","verified","accepted"],"e2e":["specified","planned","implemented","verified","accepted"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-001: El panel de detalle no sigue a la selección del árbol

## Description

https://github.com/Adayala/maitre/issues/102. Corregir la sincronización entre el árbol de Organización y el panel de detalle, preservando aislamiento por tenant y evitando escrituras sobre entidades que ya no corresponden a la selección visible.

## Acceptance criteria

- [x] **selection-sync:** El panel muestra la entidad seleccionada o se limpia cuando la navegación cambia de rama.; stages: specified, planned, implemented, verified, accepted
- [x] **unsafe-actions:** Guardar y Desactivar nunca actúan sobre una entidad distinta de la selección visible.; stages: specified, planned, implemented, verified, accepted
- [x] **tenant-safety:** La selección y las operaciones permanecen aisladas por tenant, marca y sucursal.; stages: specified, planned, implemented, verified, accepted
- [x] **tests:** Tests unitarios cubren al 100% statements, branches, functions y lines del código modificado.; stages: specified, planned, implemented, verified, accepted
- [x] **e2e:** Playwright cubre recorrido principal, cambio de rama, permisos, estados relevantes, responsive y accesibilidad.; stages: specified, planned, implemented, verified, accepted

## Required artifacts

- none
