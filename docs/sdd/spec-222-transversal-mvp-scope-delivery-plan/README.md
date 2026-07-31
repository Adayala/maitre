# [SPEC-222] MVP Scope & Delivery Plan

Contrato de alcance y secuencia que transforma el catálogo completo de Maitre en incrementos pequeños, demostrables y gobernados por evidencia.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-222 |
| **Tipo** | Transversal |
| **Subtype** | Product Delivery |
| **Dominio** | Product / Engineering |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | PROPOSED_FOR_REVIEW |
| **Prioridad** | P0 |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Antes de comenzar implementación funcional |
| **Depende de** | Foundations, SPEC-001–206 y SPEC-207–221 |

## Decisiones centrales

- Separar `MVP Demo` de `MVP Pilot`.
- El primer MVP prueba un único recorrido operativo completo, no todo el catálogo.
- Single tenant/branch en la experiencia inicial, conservando aislamiento multi-tenant en arquitectura/tests.
- Suscripciones y entitlements configurables sin checkout/billing automatizado.
- Pago registrado manualmente; gateway digital, reservas, reputación e IA quedan fuera del primer corte.
- ARCA/IVA se desarrolla como slice fiscal con gate propio antes del piloto argentino.
- Cada incremento termina desplegado, observable y reversible.

## Evidencia del recorrido core — 2026-07-30

MVP-J-001 ya demuestra con datos sintéticos y builds reales:

```text
Dash setup
  → Floor abre mesa y pedido
  → Kitchen procesa comanda
  → Floor entrega y solicita cuenta
  → Cash captura pago
  → Floor cierra visita
  → Dash muestra baseline operativo y auditoría
  → API reinicia y PostgreSQL conserva el estado
```

El gate usa Supabase efímero con migraciones desde cero, aislamiento Tenant B, audit/correlation,
evidencia sanitizada y cleanup verificado. Esto satisface el corte **MVP Demo**, pero no aprueba el
MVP Pilot ni sus requisitos comerciales, fiscales, de seguridad, DR, soporte y operación remota.
Consulta la [matriz de cierre](../../operations/mvp-gap-closure-2026-07-30.md).

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
