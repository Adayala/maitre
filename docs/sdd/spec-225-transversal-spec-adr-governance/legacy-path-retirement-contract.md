# Contrato de retiro de rutas legacy — SPEC-225

## Alcance

Este contrato gobierna el retiro de rutas históricas de specs cuando existe una ruta canónica
`docs/sdd/spec-NNN-slug/`. No autoriza por sí mismo a borrar, restaurar, mover ni agregar archivos.

El caso inicial es:

- ruta legacy: `docs/sdd/spec-entity-tenant/`;
- identidad canónica: `SPEC-001`;
- ruta canónica: `docs/sdd/spec-001-entity-tenant/`.

## Autoridad

La identidad estable es `SPEC-NNN`. El slug y la ruta son localizadores versionados, no identidades
alternativas. Una ruta sin número no puede coexistir como segunda fuente normativa de la misma spec.

Ante contenido divergente:

1. no se fusiona automáticamente;
2. se identifica el último commit y autor de cada versión;
3. se clasifica cada diferencia como normativa, editorial o histórica;
4. las decisiones normativas se trasladan mediante revisión explícita;
5. la ruta canónica conserva la única versión activa.

## Referencias

Se consideran referencias activas:

- enlaces Markdown navegables;
- rutas consumidas por scripts, configuración o CI;
- instrucciones que ordenen abrir, copiar o modificar archivos de la ruta legacy.

No son referencias activas:

- menciones históricas dentro de auditorías;
- ejemplos fenced que expliquen una convención anterior;
- registros de migración que identifiquen expresamente la ruta como legacy.

Toda referencia activa debe apuntar a la ruta canónica antes de aceptar el retiro.

## Evidencia requerida

El retiro sólo puede aprobarse cuando exista evidencia de:

- ownership o procedencia del borrado local;
- comparación entre el último contenido versionado legacy y SPEC-001 canónica;
- cero decisiones normativas exclusivas en la ruta retirada;
- cero referencias activas restantes;
- navegación válida hacia la ruta canónica;
- revisión registrada con commit exacto y outcome.

El estado previo es `PENDING_REVIEW`. La ausencia física en un checkout no equivale a
`RETIRED`.

## Historia y compatibilidad

Git conserva la historia; no se crea un duplicado permanente ni un redirect documental ambiguo.
Si un consumidor externo requiere transición, debe aprobarse un mecanismo temporal con:

- consumidor identificado;
- fecha límite;
- destino canónico explícito;
- criterio verificable de remoción.

Cuando no existen consumidores externos conocidos, la actualización atómica de referencias y el
retiro versionado son suficientes.

## Criterios de aceptación

- [ ] Procedencia del borrado confirmada.
- [ ] Diff legacy–canónico clasificado.
- [ ] Decisiones exclusivas reconciliadas.
- [ ] Cero referencias activas.
- [ ] Links documentales verificados.
- [ ] Reviewer y commit registrados.
- [ ] Outcome `RETIRED` o `KEEP_TEMPORARILY` registrado.

Ningún checkbox se marca desde esta especificación: requiere evidencia de ejecución y revisión.
