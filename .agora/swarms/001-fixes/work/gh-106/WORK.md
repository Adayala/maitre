---
schema: "agora/work/v1"
id: "gh-106"
swarm: "fixes"
title: "DASH-005: Verificar consistencia entre capacidad declarada y mesas cargadas"
state: "completed"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"availability":"Queda probado y documentado si la disponibilidad usa capacidad declarada, capacidad de mesas o una regla configurable.","confirmation":"Queda probado y documentado si puede confirmarse una reserva en un sal\u00f3n sin mesas.","seating":"El resultado de seat para una reserva sin mesas es determinista, seguro y documentado.","tenant-config":"La decisi\u00f3n considera configuraci\u00f3n por tenant y no introduce defaults globales r\u00edgidos.","tests":"Cualquier c\u00f3digo modificado alcanza 100% de statements, branches, functions y lines y se cubre el recorrido E2E afectado."}
satisfied-criteria: ["availability","confirmation","seating","tenant-config","tests"]
criterion-statuses: {"availability":["specified","planned","implemented","verified","accepted"],"confirmation":["specified","planned","implemented","verified","accepted"],"seating":["specified","planned","implemented","verified","accepted"],"tenant-config":["specified","planned","implemented","verified","accepted"],"tests":["specified","planned","implemented","verified","accepted"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-005: Verificar consistencia entre capacidad declarada y mesas cargadas

## Description

https://github.com/Adayala/maitre/issues/106. Investigar y especificar el comportamiento de disponibilidad, confirmación y seating cuando un salón activo declara capacidad pero no tiene mesas. Implementar corrección sólo después de aprobar la decisión de dominio.

## Acceptance criteria

- [x] **availability:** Queda probado y documentado si la disponibilidad usa capacidad declarada, capacidad de mesas o una regla configurable.; stages: specified, planned, implemented, verified, accepted
- [x] **confirmation:** Queda probado y documentado si puede confirmarse una reserva en un salón sin mesas.; stages: specified, planned, implemented, verified, accepted
- [x] **seating:** El resultado de seat para una reserva sin mesas es determinista, seguro y documentado.; stages: specified, planned, implemented, verified, accepted
- [x] **tenant-config:** La decisión considera configuración por tenant y no introduce defaults globales rígidos.; stages: specified, planned, implemented, verified, accepted
- [x] **tests:** Cualquier código modificado alcanza 100% de statements, branches, functions y lines y se cubre el recorrido E2E afectado.; stages: specified, planned, implemented, verified, accepted

## Required artifacts

- none
