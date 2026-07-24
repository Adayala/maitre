# Rules — SPEC-105

- La creación de alerts pertenece al rule evaluator, no al cliente.
- `acknowledge`, `resolve` y `escalate` requieren expected revision e idempotency.
- Resolve exige resolution code/cause aprobados.
- Dedupe usa fingerprint + evidence window; post-resolve crea activation nueva.
- Una alert no muta Commands ni otras autoridades operativas implícitamente.
