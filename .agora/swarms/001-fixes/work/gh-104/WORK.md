---
schema: "agora/work/v1"
id: "gh-104"
swarm: "fixes"
title: "DASH-003: El contador de salones muestra 0 hasta que se expande el nodo"
state: "drafting"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"collapsed-count":"El nodo colapsado muestra la cantidad real sin depender de hijos cargados localmente.","expanded-count":"Expandir o colapsar el nodo no cambia incorrectamente el contador.","pluralization":"Se muestran correctamente 0 salones, 1 sal\u00f3n y N salones mediante textos configurables.","tenant-safety":"Los conteos respetan tenant, marca, sucursal y permisos.","tests":"El c\u00f3digo modificado tiene 100% de statements, branches, functions y lines.","e2e":"Playwright cubre loading, empty, singular, plural, error, responsive y accesibilidad."}
satisfied-criteria: []
criterion-statuses: {"collapsed-count":[],"expanded-count":[],"pluralization":[],"tenant-safety":[],"tests":[],"e2e":[]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-003: El contador de salones muestra 0 hasta que se expande el nodo

## Description

https://github.com/Adayala/maitre/issues/104. Corregir el contador de salones del mapa de Organización para que sea exacto antes de expandir el nodo y tenga pluralización correcta.

## Acceptance criteria

- [ ] **collapsed-count:** El nodo colapsado muestra la cantidad real sin depender de hijos cargados localmente.; stages: none
- [ ] **expanded-count:** Expandir o colapsar el nodo no cambia incorrectamente el contador.; stages: none
- [ ] **pluralization:** Se muestran correctamente 0 salones, 1 salón y N salones mediante textos configurables.; stages: none
- [ ] **tenant-safety:** Los conteos respetan tenant, marca, sucursal y permisos.; stages: none
- [ ] **tests:** El código modificado tiene 100% de statements, branches, functions y lines.; stages: none
- [ ] **e2e:** Playwright cubre loading, empty, singular, plural, error, responsive y accesibilidad.; stages: none

## Required artifacts

- none
