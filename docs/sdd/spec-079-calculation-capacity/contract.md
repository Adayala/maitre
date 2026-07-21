# Contrato de cálculo — SPEC-079 Capacity

Entrada versionada: Branch timezone, salons/tables activas, partySize, duration, reservations,
occupancies, blocks y policy, con `asOf`. Salida: slots/capacity/reason codes; sin side effects.
El algoritmo es determinista, no usa reloj global, evita double allocation y explica
indisponibilidad sin revelar otros guests. Fixtures cubren combinaciones de mesas, buffers,
overlap, DST, stale inputs, blocks y concurrencia de confirmación.
