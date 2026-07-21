# [SPEC-003] FiscalEntity Entity

Persona humana o jurídica que emite comprobantes fiscales. Contiene CUIT, condición tributaria, certificados ARCA.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-003 |
| **Título** | FiscalEntity Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Estado** | PLANNED |
| **Readiness** | NOT_ASSESSED |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | 1 |
| **Estimación** | 8h |

## Overview

Cada tenant puede tener múltiples entidades fiscales (personas o empresas). Cada entidad fiscal:
- Tiene CUIT único
- Emite comprobantes (facturas, recibos, notas de crédito)
- Registra puntos de venta en ARCA
- Tiene condición tributaria (Responsable Inscripto, Monotributista, etc)

## Related Specs

**Dependencias:** [SPEC-001] Tenant Entity ✅

**Dependientes:** [SPEC-004] Branch Entity, [SPEC-009] FiscalEntities API, [SPEC-127] FiscalPoint Entity

## Status tracking

- [ ] objective.md
- [ ] specification.md
- [ ] structure.md
- [ ] rules.md
- [ ] plan.md
- [ ] tasks.md
- [ ] verification.md
- [ ] notes.md
- [ ] Peer review

## Documentos normativos

- [Contrato](contract.md)
