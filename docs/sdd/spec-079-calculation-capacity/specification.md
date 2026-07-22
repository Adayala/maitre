# Especificación — SPEC-079 Capacity Calculator

Función pura que recibe `asOf`, timezone, policy version, salons/tables activas, party size,
duration, buffers, holds/allocations, occupancy y blocks. Devuelve slots/combinaciones posibles y
reason codes sin PII ni side effects.

Los intervalos son semiabiertos `[start,end)`. Una mesa no participa en asignaciones solapadas;
una combinación sólo es válida si todas sus mesas están disponibles durante intervalo + buffers.
Los empates se resuelven de forma estable por waste de capacidad, cantidad de mesas y IDs.

El cálculo no evita por sí mismo double allocation: confirm/seat adquieren lock o constraint sobre
el ledger de capacidad y reejecutan la validación dentro de la transacción. Inputs obsoletos pueden
servir para consulta, nunca como autorización de escritura.
