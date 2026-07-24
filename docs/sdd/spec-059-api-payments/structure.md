# Estructura — SPEC-059

API autenticada → Payment application → provider port/CashMovement port → Payment/Refund
repositories + outbox. Callback ingress → autenticación/anti-replay → receipt deduplicado →
misma aplicación. Receipt y reconciliation comparten provider operation identity; los
instrumentos y secretos permanecen fuera del dominio, DTOs y logs.
