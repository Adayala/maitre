# Contrato de cálculo — SPEC-079 Capacity

Entrada versionada: Branch timezone, salons/tables activas, partySize, duration,
holds/allocations, occupancies, blocks y policy, con `asOf`. Salida: slots/capacity/reason codes;
sin side effects. El algoritmo es determinista y no usa reloj global. Double allocation se evita
mediante la autoridad transaccional de CapacityHold/CapacityAllocation, no mediante este cálculo.
Fixtures cubren combinaciones de mesas, buffers, overlap, DST, stale inputs, blocks y confirmación
concurrente.
