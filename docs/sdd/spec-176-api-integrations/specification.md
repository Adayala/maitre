# Especificación — SPEC-176 Integrations API

Create/list/detail/configure/activate/disable/upgrade. Config se valida por adapter version y no
acepta provider base URLs arbitrarias salvo capability explícita. Secret input usa canal dedicado y
se convierte a opaque reference que nunca vuelve a mostrarse.

Mutations usan idempotency + `If-Match`. Activate exige provider spike PASS, OwnershipMatrix,
credentials/capabilities válidas y test permitido. Disable revoca recepción/jobs sin borrar runs.
