# Objetivo — SPEC-102

Definir la API autoritativa para consultar y ejecutar transiciones explícitas sobre Commands con
alcance de station, revisión esperada e idempotencia.

## Criterios de aceptación

### CAD-102-01 — La API expone comandos explícitos sin `PATCH status` implícito

list/detail y comandos operativos soportados quedan definidos sin `PATCH status` implícito.

### CAD-102-02 — Toda mutación usa revisión, idempotencia, permiso y alcance de station válidos

toda mutación usa `If-Match`, idempotency key, permiso y alcance de station válidos.

### CAD-102-03 — Las transiciones siguen SPEC-110 con errores estables

transiciones respetan la tabla normativa de SPEC-110 con contratos de error estables.

### CAD-102-04 — Transfer conserva identidad y atomicidad auditada

transfer es atómica, auditada y conserva identidad estable del Command.

### CAD-102-05 — Lecturas y respuestas redactan instrucciones sensibles según audiencia

respuestas y lecturas aplican redacción de instrucciones sensibles según audiencia/permiso.

### CAD-102-06 — La aprobación exige evidencia de concurrencia, transfer y RBAC

La aprobación exige fixtures de concurrencia, retries, terminalidad, transfer, RBAC y
aislamiento.
