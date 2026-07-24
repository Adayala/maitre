# Rules — SPEC-079

- Intervalos son semiabiertos `[start,end)`; buffers expanden el intervalo antes de overlap.
- Hold cuenta sólo si HELD y `expiresAt > asOf`; Allocation/Occupancy/Block según lifecycle autoritativo.
- IDs y topology pertenecen a tenant/Branch del snapshot; incoherencia falla cerrado.
- Combinaciones sólo usan edges/configuración de la PolicyVersion; no se inventan adyacencias.
- Mismos inputs serializados, asOf y revisions producen mismo output y orden.
- Staleness se reporta; no se corrige leyendo reloj o repositorios ocultos.
- Un cálculo exitoso no concede capacidad ni evita locks/constraints al confirmar.
