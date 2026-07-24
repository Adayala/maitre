# Objetivo — SPEC-123

Definir políticas laborales versionadas y un evaluador explicable de compliance que preserve
evidencia sin automatizar decisiones humanas sensibles.

## Criterios de aceptación

### CAD-123-01 — LaborPolicyVersion conserva jurisdicción, fuente, vigencia y aprobación competente

LaborPolicyVersion conserva jurisdicción, fuente, vigencia, provenance y aprobación
competente.

### CAD-123-02 — Tenant rules sólo endurecen cuando la policy lo permite

tenant rules sólo pueden endurecer cuando la policy lo permite y conservan provenance
explícita.

### CAD-123-03 — Findings incluyen evidencia, rule version y occurrence date explicables

findings INFO/WARNING/BLOCKING incluyen evidencia, rule version y occurrence date
explicables.

### CAD-123-04 — El evaluador no automatiza decisiones humanas sensibles ni modifica evidencia

el evaluador no sanciona, despide, modifica evidencia ni decide automáticamente cuestiones
laborales.

### CAD-123-05 — `NOT_CONFIGURED` bloquea afirmaciones de cumplimiento sin perder evidencia

sin policy aprobada el sistema devuelve `NOT_CONFIGURED` y bloquea afirmaciones de
cumplimiento manteniendo captura/evidencia.

### CAD-123-06 — La aprobación exige evidencia de descansos, máximos, DST y no-configurado

La aprobación exige fixtures de descansos, máximos, menores cuando aplique, DST,
retroactividad, excepciones y no-configurado.
