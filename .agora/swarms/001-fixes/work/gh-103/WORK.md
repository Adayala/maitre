---
schema: "agora/work/v1"
id: "gh-103"
swarm: "fixes"
title: "DASH-002: Datos residuales de corridas E2E automatizadas en el entorno demo"
state: "drafting"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"isolation":"Cada ejecuci\u00f3n usa un identificador y alcance de tenant deterministas sin compartir datos con la demo manual.","cleanup":"El teardown elimina \u00fanicamente entidades creadas por la ejecuci\u00f3n correspondiente y reporta cualquier fallo.","failure-path":"La limpieza se ejecuta tambi\u00e9n ante fallos y no oculta el resultado original del test.","tests":"La l\u00f3gica modificada alcanza 100% de statements, branches, functions y lines.","e2e":"Una prueba demuestra que tras el journey no quedan entidades creadas por esa corrida."}
satisfied-criteria: []
criterion-statuses: {"isolation":[],"cleanup":[],"failure-path":[],"tests":[],"e2e":[]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-002: Datos residuales de corridas E2E automatizadas en el entorno demo

## Description

https://github.com/Adayala/maitre/issues/103. Evitar que las pruebas E2E dejen marcas, sucursales, salones o mesas residuales en el tenant demo; definir fixtures deterministas y limpieza segura por run y tenant.

## Acceptance criteria

- [ ] **isolation:** Cada ejecución usa un identificador y alcance de tenant deterministas sin compartir datos con la demo manual.; stages: none
- [ ] **cleanup:** El teardown elimina únicamente entidades creadas por la ejecución correspondiente y reporta cualquier fallo.; stages: none
- [ ] **failure-path:** La limpieza se ejecuta también ante fallos y no oculta el resultado original del test.; stages: none
- [ ] **tests:** La lógica modificada alcanza 100% de statements, branches, functions y lines.; stages: none
- [ ] **e2e:** Una prueba demuestra que tras el journey no quedan entidades creadas por esa corrida.; stages: none

## Required artifacts

- none
