# Verificación — SPEC-102

## Criterios

### CAD-102-01 — La API expone comandos explícitos sin `PATCH status` implícito

- [ ] endpoints y comandos explícitos reemplazan cualquier patch implícito.

### CAD-102-02 — Toda mutación usa revisión, idempotencia, permiso y station scope válidos

- [ ] `If-Match`, idempotency y scope de station gobiernan toda mutación.

### CAD-102-03 — Las transiciones siguen SPEC-110 con errores estables

- [ ] `412`, `409`, `422` y `404` siguen contrato estable contra SPEC-110.

### CAD-102-04 — Transfer conserva identidad y atomicidad auditada

- [ ] transfer conserva identidad y evita doble ownership observable.

### CAD-102-05 — Lecturas y respuestas redactan instrucciones sensibles según audiencia

- [ ] redactions protegen instrucciones sensibles según permiso.

### CAD-102-06 — La aprobación exige evidencia de concurrencia, transfer y RBAC

- [ ] fixtures cubren carreras, retries, transfer y cross-scope.
