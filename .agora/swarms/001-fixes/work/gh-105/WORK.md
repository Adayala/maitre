---
schema: "agora/work/v1"
id: "gh-105"
swarm: "fixes"
title: "DASH-004: Nombres ambiguos entre sucursales sin desambiguaci\u00f3n en el \u00e1rbol"
state: "drafting"
operational-status: "active"
status-reason: null
status-by: null
status-at: null
acceptance-criteria: {"context":"El detalle identifica claramente marca, sucursal y sal\u00f3n aun cuando los ancestros no est\u00e1n visibles.","white-label":"Etiquetas, textos y presentaci\u00f3n se resuelven desde la configuraci\u00f3n de tenant o marca.","permissions":"No se revela contexto que el rol actual no pueda consultar.","tests":"El c\u00f3digo modificado tiene 100% de statements, branches, functions y lines.","e2e":"Playwright cubre nombres repetidos, navegaci\u00f3n, permisos, responsive y accesibilidad."}
satisfied-criteria: []
criterion-statuses: {"context":[],"white-label":[],"permissions":[],"tests":[],"e2e":[]}
required-artifacts: []
child-work-refs: []
budget-limits: null
---

# DASH-004: Nombres ambiguos entre sucursales sin desambiguación en el árbol

## Description

https://github.com/Adayala/maitre/issues/105. Desambiguar salones homónimos mostrando su ruta de marca y sucursal de forma persistente y configurable en el mapa de Organización.

## Acceptance criteria

- [ ] **context:** El detalle identifica claramente marca, sucursal y salón aun cuando los ancestros no están visibles.; stages: none
- [ ] **white-label:** Etiquetas, textos y presentación se resuelven desde la configuración de tenant o marca.; stages: none
- [ ] **permissions:** No se revela contexto que el rol actual no pueda consultar.; stages: none
- [ ] **tests:** El código modificado tiene 100% de statements, branches, functions y lines.; stages: none
- [ ] **e2e:** Playwright cubre nombres repetidos, navegación, permisos, responsive y accesibilidad.; stages: none

## Required artifacts

- none
