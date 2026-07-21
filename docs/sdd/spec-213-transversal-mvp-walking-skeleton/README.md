# [SPEC-213] MVP Walking Skeleton

Primer corte vertical ejecutable de Maitre: desde el navegador hasta persistencia, identidad, observabilidad y despliegue.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-213 |
| **Tipo** | Transversal / Delivery |
| **Dominio** | Platform / Product |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Primer incremento implementable |
| **Depende de** | SPEC-001, SPEC-004, SPEC-017, SPEC-020, SPEC-023, SPEC-207–212 |

## Resultado demostrable

Un usuario de demo puede autenticarse, entrar a una sucursal autorizada, ver el shell de Dash y consultar el estado del sistema. El recorrido atraviesa React.js, API Node.js, contratos, caso de uso, PostgreSQL/Supabase, telemetría y Vercel.

El corte no introduce lógica ficticia que luego deba descartarse.

`GET /v1/me/context` descubre los contextos permitidos. Los headers de selección se usan recién en requests tenant-scoped posteriores y nunca conceden autoridad.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
