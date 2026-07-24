# Objetivo — SPEC-225

Mantener una única interpretación vigente del producto y su arquitectura, con trazabilidad suficiente para que personas y agentes implementen sin adivinar requisitos ni revivir decisiones descartadas.

## Resultados esperados

- Estado de cada spec inequívoco y verificable.
- Aprobadores y evidencia proporcionales al riesgo.
- Cambios compatibles/incompatibles tratados de manera distinta.
- ADRs enlazados con las specs que condicionan.
- Índices sin IDs duplicados, links rotos o dependencias circulares ocultas.
- Código, tests y documentación sincronizados en el mismo cambio.

## Fuera de alcance

- Convertir cualquier edición documental en una ceremonia extensa.
- Requerir reuniones para cambios editoriales.
- Mantener decisiones obsoletas como si continuaran vigentes.
- Autorizar implementación automáticamente porque existe un directorio de spec.

## Criterios de aceptación

### CAD-225-01 — El lifecycle documental distingue claramente draft, ready, verified, deprecated y superseded

Cada spec y ADR tiene estado inequívoco, con transición gobernada y evidencia mínima proporcional al riesgo. La existencia del directorio no autoriza implementación por sí misma.

### CAD-225-02 — IDs, links, dependencias e índices se validan como un sistema documental único

No se permiten IDs duplicados, referencias rotas, dependencias inexistentes ni divergencia entre registros e índices. La navegación y reachability forman parte del contrato.

### CAD-225-03 — Los cambios compatibles e incompatibles siguen flujos distintos y trazables

Cambios breaking reabren revisión, versionado o migración explícita. Los cambios editoriales evitan ceremonias innecesarias sin perder trazabilidad.

### CAD-225-04 — Specs, ADRs, código, tests y releases se mantienen sincronizados en el mismo cambio

La gobernanza exige que la documentación vigente, el código y la evidencia de implementación no diverjan sin detección. Los PRs de implementación enlazan specs listas y sus criterios cubiertos.

### CAD-225-05 — El validador documental y su baseline histórica son deterministas, versionados y sin dependencia de red

La validación de estructura, metadata, links y debt baseline debe ejecutarse en local y CI con resultados deterministas. Las excepciones históricas nuevas fallan salvo aprobación explícita.

### CAD-225-06 — Las decisiones arquitectónicas mantienen autoridad, sucesión y evidencia verificables

Los ADRs preservan identidad, estado, deciders y relación con las specs afectadas. Una decisión reemplazada o conflictiva no puede permanecer ambigua para implementadores humanos o agentes.
