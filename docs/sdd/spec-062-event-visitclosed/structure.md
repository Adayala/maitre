# Estructura — SPEC-062

Dos schemas versionados comparten aggregate/partition Visit. Closed se produce en la
transacción de cierre/outbox; Reopened, en la transacción del workflow correctivo/outbox.
Cada schema define envelope, scope, referencias y revisiones mínimas y rechaza campos
financieros o personales adicionales.
