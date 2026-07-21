# [SPEC-006] Table Entity

Mesa física con capacidad, número, ubicación.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-006 |
| **Título** | Table Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Estado** | PLANNED |
| **Readiness** | NOT_ASSESSED |
| **Prioridad** | P1 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | 1 |
| **Estimación** | 4h |

## Overview

Una mesa es un recurso físico con:
- Número (1, 2, 3, ... T1, T2, T3 para terraza)
- Capacidad (cuántas personas caben)
- Posición x,y (para plano del salón)
- Salon que la contiene

Su estado (AVAILABLE, OCCUPIED, PAYING, etc) se **deriva** de ocupaciones y reservas, no se almacena directamente.

## Related Specs

**Dependencias:** [SPEC-005] Salon ✅

**Dependientes:** [SPEC-012] Tables API, [SPEC-058] TableOccupation Entity

**Status: PLANNED**
