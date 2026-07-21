# Decisiones — SPEC-225

## Decisiones

- Se agrega `IN_REVIEW` para distinguir escritura de una propuesta completa bajo evaluación.
- `VERIFIED` reemplaza gradualmente `DONE`, porque terminar documentos no demuestra comportamiento.
- IDs no expresan prioridad ni fase; SPEC-222 controla secuencia sin renumerar.
- ADRs y specs se enlazan pero no se fusionan: responden preguntas diferentes.
- Tooling valida estructura; aprobación humana/agente revisa semántica y trade-offs.
- El primer uso de esta política será revisar el subset I0, no aprobar en bloque todas las specs existentes.
- Estado, readiness y blockers son dimensiones separadas para evitar valores compuestos imposibles de validar.
- La deuda histórica se adopta mediante línea base explícita y monotónica; no se relajan reglas para documentos nuevos.
- Los README de specs son la fuente autoritativa de metadata; catálogo e índices se derivan para evitar triple mantenimiento.

## Deuda existente a auditar

- specs históricas con estructura o nombre anterior;
- estados `DONE` que podrían significar sólo documentación completa;
- índices/roadmaps con conteos o slugs divergentes;
- decisiones aceptadas embebidas en notes sin ADR;
- duplicación entre guías extensas y specs transversales;
- referencias a archivos eliminados o renombrados.

La fotografía cuantitativa inicial y su estrategia de remediación están en
[registry-baseline-audit.md](registry-baseline-audit.md). Sus conteos son evidencia de
auditoría documental, no resultado del futuro comando `npm run sdd:validate`.

## Métricas

- specs por estado y tiempo en review;
- findings de `sdd:validate`;
- implementaciones sin spec READY;
- cambios reabiertos por ambigüedad;
- conflictos/drift detectados antes versus después de merge;
- ADRs superseded sin successor o trigger de revisión.
