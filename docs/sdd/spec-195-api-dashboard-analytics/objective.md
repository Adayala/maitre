# Objetivo — SPEC-195

Definir la API de dashboards analytics con render tolerante a fallas parciales y controles estrictos
de sharing/export.

## Criterios de aceptación

### CAD-195-01 — La API cubre create, edit, publish, version y render de dashboards analytics

La API expone create/edit/publish/version y render de dashboards analytics.

### CAD-195-02 — Render autoriza cada widget y filtro antes de ejecutarlo

Render autoriza cada widget y filtro antes de ejecutarlo.

### CAD-195-03 — Cada widget devuelve resultado parcial con metadata y error tipado

Cada widget devuelve partial result con freshness, coverage, suppression y error tipado propio.

### CAD-195-04 — Una métrica retirada aparece unavailable con successor

Una métrica retirada se presenta como unavailable con sucesor y no como valor stale silencioso.

### CAD-195-05 — Cache aísla tenant y permisos; share/clone no amplían acceso

Cache es tenant/permiso-aware; compartir o clonar conserva refs pero no acceso y export es
capability separada que reaplica privacidad.

### CAD-195-06 — La aprobación exige evidencia de render parcial, retired metric, cache y export

La aprobación exige fixtures de render parcial, retired metric handling, cache isolation,
sharing/cloning y export con privacidad reaplicada.
