# [SPEC-145] ARCA Integration API

| Campo                | Valor                                       |
| -------------------- | ------------------------------------------- |
| **ID**               | SPEC-145                                    |
| **Tipo**             | API                                         |
| **Dominio**          | Fiscal                                      |
| **Estado**           | IN_PROGRESS                                 |
| **Readiness**        | HOMOLOGATION_VALIDATED / PRODUCTION_BLOCKED |
| **Prioridad**        | P0                                          |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED                     |
| **Fase**             | 4                                           |

> **Estado real:** el cliente reutilizable WSAA/WSFEv1 y `Wsfev1ArcaAdapter` están implementados y
> `FEDummy` fue validado con credenciales de homologación. `SimulatedArcaAdapter` permanece sólo
> para desarrollo/tests y está prohibido para comprobantes productivos. Producción continúa
> bloqueada hasta completar identidad fiscal definitiva, certificado, punto de venta verificado,
> secuenciación distribuida, runbook y aprobación fiscal competente.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Historial: cliente reutilizable de facturación electrónica](implementation-history/add-arca-electronic-invoicing/proposal.md)
