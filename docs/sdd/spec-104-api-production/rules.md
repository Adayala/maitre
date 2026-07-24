# Rules — SPEC-104

- La cola es proyección read-only con freshness explícita.
- Mutaciones operativas validan siempre contra Command autoritativo, no contra la proyección.
- Claim concurrente admite un solo owner efectivo.
- Hold requiere reason; resume vuelve por transición autorizada.
- Ready y complete-handoff no equivalen a delivery al Guest.
