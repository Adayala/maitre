# [SPEC-059] Payments API

## Metadata

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| **ID**               | SPEC-059                |
| **Título**           | Payments API            |
| **Tipo**             | API                     |
| **Dominio**          | Billing & Payments      |
| **Estado**           | IN_PROGRESS             |
| **Readiness**        | WALKING_SKELETON_I0     |
| **Prioridad**        | P1                      |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Fase**             | 2                       |

## Estado implementado

Cash ya consulta cuentas `PAYMENT_PENDING`, muestra saldo/contexto y captura el pago manual mediante
la API real. Los journeys validan pago exacto, fallo, captura parcial y liquidación del remanente.
Siguen abiertos refunds, callbacks de proveedores, conciliación completa, propinas y la matriz
exhaustiva de idempotencia/concurrencia definida por esta SPEC.

## Documentos normativos

- [Especificación](specification.md)
- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Historial: pagos pendientes en Cash](implementation-history/add-cash-pending-payments/proposal.md)
