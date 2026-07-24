# Objetivo — SPEC-149

Definir la API para consulta y administración restringida del catálogo normativo de alícuotas, con
resolución reproducible por fecha, jurisdicción y tratamiento fiscal.

## Criterios de aceptación

### CAD-149-01 — La API separa lectura/resolución tenant de la administración normativa restringida

la API separa lectura/resolución para tenants de la administración restringida del catálogo
normativo por plataforma.

### CAD-149-02 — No existe create arbitrario tenant; publicar exige revisión normativa

no existe create arbitrario para usuarios tenant; publicar/versionar exige
`NormativeSourceVersion`, reviewer fiscal, vigencia y ausencia de solapamientos.

### CAD-149-03 — Los mappings operativos viven en boundary separado

los mappings de producto/categoría interna se administran por boundary separado y no mutan
el catálogo oficial.

### CAD-149-04 — `resolve` devuelve versión normativa, provenance y tasa exacta o falla seguro

`resolve` recibe fecha, jurisdiction y treatment y devuelve versión normativa, provenance y
tasa exacta o falla en modo seguro.

### CAD-149-05 — Ausencia o ambigüedad normativa bloquea el uso fiscal downstream

ausencia, ambigüedad o incompatibilidad normativa devuelve error semántico explícito y
bloquea el uso fiscal downstream.

### CAD-149-06 — La aprobación exige evidencia de vigencias, conflictos y preservación histórica

La aprobación exige fixtures de vigencias, conflictos, permissions, resolve exacto y
preservación histórica.
