# Decisiones — SPEC-225

## Decisiones

- Se agrega `IN_REVIEW` para distinguir escritura de una propuesta completa bajo evaluación.
- `VERIFIED` reemplaza gradualmente `DONE`, porque terminar documentos no demuestra comportamiento.
- IDs no expresan prioridad ni fase; SPEC-222 controla secuencia sin renumerar.
- ADRs y specs se enlazan pero no se fusionan: responden preguntas diferentes.
- Tooling valida estructura; aprobación humana/agente revisa semántica y trade-offs.
- El primer uso de esta política será revisar el subset I0, no aprobar en bloque todas las specs existentes.

## Deuda existente a auditar

- specs históricas con estructura o nombre anterior;
- estados `DONE` que podrían significar sólo documentación completa;
- índices/roadmaps con conteos o slugs divergentes;
- decisiones aceptadas embebidas en notes sin ADR;
- duplicación entre guías extensas y specs transversales;
- referencias a archivos eliminados o renombrados.

## Métricas

- specs por estado y tiempo en review;
- findings de `sdd:validate`;
- implementaciones sin spec READY;
- cambios reabiertos por ambigüedad;
- conflictos/drift detectados antes versus después de merge;
- ADRs superseded sin successor o trigger de revisión.
