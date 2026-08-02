# Inventario de runtime y persistencia

## Objetivo

Dejar explícito qué partes de Maitre ya corren sobre Supabase en el runtime operativo principal, cuáles tienen evidencia live reciente y dónde siguen existiendo brechas reales.

## Estado actualizado el 2 de agosto de 2026

| Área                   | Adapter Supabase | Wiring en `apps/api` | Evidencia reciente                                                    | Gap principal                                                  |
| ---------------------- | ---------------- | -------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| Identity / memberships | Sí               | Sí                   | roles fixture y límites representativos validados                     | Falta login productivo y matriz RBAC completa por app          |
| Organization           | Sí               | Sí                   | MVP-J-003 crea tenant, marca, sucursal, salón, mesa, jornada y plaza  | Falta alta integral exclusivamente por UI                      |
| Floor                  | Sí               | Sí                   | MVP-J-001/J005 cubren visita, pedido, entrega, cuenta y cierre        | Faltan walk-in, transferencias, split/merge y offline          |
| Reservations           | Sí               | Sí                   | MVP-J-004 cubre Guest→Host→Floor con confirmación/no-show/cancelación | Falta llegada, seating, seña y recordatorios                   |
| Ordering               | Sí               | Sí                   | MVP-J-001/J005 cubren pedido, agotado, reemplazo y entrega            | Faltan dos rondas, bebida/postre y QR híbrido                  |
| Kitchen                | Sí               | Sí                   | lifecycle, pausa/reanudación, handoff y cancelación autorizada live   | Faltan multi-estación, concurrencia y recuperación             |
| Cash                   | Sí               | Sí                   | pago exacto, fallido, parcial, remanente y settlement live            | Faltan apertura/cierre, conciliación, refund, propina y fiscal |
| Fiscal                 | Sí               | Sí                   | migraciones, asociación fiscal, WSAA y `FEDummy` real en homologación | matriz de comprobantes y rollout productivo pendientes         |
| Workforce              | Sí               | Sí                   | MVP-J-003 crea roles, employments y asignación de plaza               | Falta login real, turnos, fichaje y políticas laborales        |
| Catalog                | Sí               | Sí                   | productos reales usados en journeys                                   | Falta publicación/consumo completo desde Guest y QR            |
| Subscription           | Sí               | Sí                   | tenant nuevo recibe STARTER y capacidades del journey                 | Falta lifecycle owner/backoffice y expansión/reducción         |
| Audit                  | Sí               | Sí                   | MVP-J-001 valida evidencia correlacionada visible                     | Falta explotación amplia, exportación y alertas                |

### Detalle fiscal vigente

- Migración de ownership/registro ARCA aplicada.
- Suscripción del tenant de desarrollo asociada a una entidad fiscal `RI`.
- Sucursal principal y POS `0001` de homologación asociados a la misma entidad.
- Alta guardada como `DECLARED`; producción exige `VERIFIED`.
- La razón social usada en desarrollo es temporal y no puede promoverse a producción.
- El adapter simulado rechaza cualquier comprobante marcado `PRODUCTION`.

## Observabilidad y contrato API

- `packages/telemetry` envuelve el SDK de OpenTelemetry (trazas y métricas) y se
  usa desde `apps/api`; no hay todavía dashboards ni alertas operativas
  documentadas, sólo la instrumentación de base.
- `apps/api/src/openapi-generator.ts` genera `apps/api/openapi/openapi.json`
  desde la app Fastify en runtime (`app.swagger()` + contratos de payload por
  operación). Es la fuente autoritativa de rutas HTTP realmente expuestas; no
  hay todavía un job de CI que falle si el spec commiteado queda desactualizado
  respecto del código.

## Qué ya no es un gap

- La existencia de `adapters/persistence/memory` no implica que el runtime principal siga en memoria.
- Con credenciales válidas, `apps/api` prioriza Supabase como persistencia y auth operativa.
- El fallback `memory`/`fixture` queda reservado a tests, demos locales sin infraestructura o builds de desarrollo.

## Gaps reales que quedan

1. Completar evidencia live por dominio y por app, no sólo por repositorio.
2. Cerrar recorridos UI que todavía no prueban todos los casos contra datos reales.
3. Confirmar rollout/migrations de cada subdominio en el proyecto Supabase conectado.
4. Hacer visible el estado de outbox, auditoría y jobs operativos desde superficies administrativas.

La matriz detallada, la evidencia reciente y el backlog por prioridad viven en
[20-e2e-flow-coverage.md](20-e2e-flow-coverage.md).

## Cómo usar este inventario

Cuando abramos un nuevo bloque de implementación, conviene priorizar por esta secuencia:

1. dominios con wiring Supabase pero sin prueba live;
2. superficies UI que todavía no consumen esos flujos de punta a punta;
3. recién después, limpieza del fallback local y endurecimiento operativo.
