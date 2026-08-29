---
schema: "agora/work/v1"
id: "gh-104"
swarm: "fixes"
title: "DASH-003: El contador de salones muestra 0 hasta que se expande el nodo"
state: "completed"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"collapsed-count":"El nodo colapsado muestra la cantidad real sin depender de hijos cargados localmente.","expanded-count":"Expandir o colapsar el nodo no cambia incorrectamente el contador.","pluralization":"Se muestran correctamente 0 salones, 1 sal\u00f3n y N salones mediante textos configurables.","tenant-safety":"Los conteos respetan tenant, marca, sucursal y permisos.","tests":"El c\u00f3digo modificado tiene 100% de statements, branches, functions y lines.","e2e":"Playwright cubre loading, empty, singular, plural, error, responsive y accesibilidad."}
satisfied-criteria: ["collapsed-count","expanded-count","pluralization","tenant-safety","tests","e2e"]
criterion-statuses: {"collapsed-count":["specified","planned","implemented","verified","accepted"],"expanded-count":["specified","planned","implemented","verified","accepted"],"pluralization":["specified","planned","implemented","verified","accepted"],"tenant-safety":["specified","planned","implemented","verified","accepted"],"tests":["specified","planned","implemented","verified","accepted"],"e2e":["specified","planned","implemented","verified","accepted"]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-003: El contador de salones muestra 0 hasta que se expande el nodo

## Description

https://github.com/Adayala/maitre/issues/104. Corregir el contador de salones del mapa de Organización para que sea exacto antes de expandir el nodo y tenga pluralización correcta.

## Acceptance criteria

- [x] **collapsed-count:** El nodo colapsado muestra la cantidad real sin depender de hijos cargados localmente.; stages: specified, planned, implemented, verified, accepted
- [x] **expanded-count:** Expandir o colapsar el nodo no cambia incorrectamente el contador.; stages: specified, planned, implemented, verified, accepted
- [x] **pluralization:** Se muestran correctamente 0 salones, 1 salón y N salones mediante textos configurables.; stages: specified, planned, implemented, verified, accepted
- [x] **tenant-safety:** Los conteos respetan tenant, marca, sucursal y permisos.; stages: specified, planned, implemented, verified, accepted
- [x] **tests:** El código modificado tiene 100% de statements, branches, functions y lines.; stages: specified, planned, implemented, verified, accepted
- [x] **e2e:** Playwright cubre loading, empty, singular, plural, error, responsive y accesibilidad.; stages: specified, planned, implemented, verified, accepted

## Required artifacts

- none
