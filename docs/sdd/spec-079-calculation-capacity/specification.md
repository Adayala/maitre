# Especificación — SPEC-079 Capacity Calculator

Función pura que recibe un snapshot:

- `asOf`, timezone IANA, query window y slot granularity;
- CapacityPolicyVersion y revisiones de todos los inputs;
- salons/tables activas, capacities y grafo allowlisted de combinaciones;
- partySize, duration y preferencias no sensibles tipadas;
- Holds HELD no expirados a `asOf`, Allocations CONFIRMED, Occupancies ACTIVE y blocks;
- buffers antes/después por tipo de recurso.

Devuelve slots con intervalo, combinaciones candidatas internas, capacity/waste, reason
codes, input revisions y freshness, sin PII ni side effects. La API pública puede redactar
unit IDs sin cambiar el cálculo.

Los intervalos son semiabiertos `[start,end)`. Una mesa no participa en asignaciones solapadas;
una combinación sólo es válida si todas sus mesas están disponibles durante intervalo + buffers.
Para cada slot alineado a policy: descarta unidades inactivas o con overlap sobre intervalo
más buffers; enumera sólo combinaciones permitidas por el grafo y límites; valida partySize
y requirements operativos. Ranking: menor waste, menor cantidad de mesas, menor penalty
tipada y vector de IDs ascendente.

El cálculo no evita por sí mismo double allocation: confirm/seat adquieren lock o constraint sobre
el ledger de capacidad y reejecutan la validación dentro de la transacción. Inputs obsoletos pueden
servir para consulta, nunca como autorización de escritura.

Reason catalog I0: `OUTSIDE_SERVICE_WINDOW`, `PARTY_SIZE_UNSUPPORTED`, `NO_ACTIVE_UNITS`,
`CAPACITY_CONFLICT`, `BLOCKED`, `POLICY_RESTRICTION`, `INPUT_STALE` y
`CALCULATION_LIMIT`. Al exceder slots/unidades/combinaciones/tiempo lógico definidos por
policy, devuelve `CALCULATION_LIMIT` y no mezcla resultado truncado con disponibilidad completa.
