# Reglas — SPEC-196

- Preview no emite notificaciones ni side effects.
- Commands usan `If-Match` e idempotencia.
- Resolve/dismiss requieren reason.
- Fallo de notificación no muta activation.
- Inputs stale/contradictorios bloquean automation.
