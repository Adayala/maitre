# Inventario de runtime y persistencia

## Objetivo

Dejar explícito qué partes de Maitre ya corren sobre Supabase en el runtime operativo principal, cuáles tienen evidencia live reciente y dónde siguen existiendo brechas reales.

## Estado relevado el 29 de julio de 2026

| Área | Adapter Supabase | Wiring en `apps/api` | Evidencia reciente | Gap principal |
| --- | --- | --- | --- | --- |
| Identity / memberships | Sí | Sí | `/v1/me/context` validado | Falta más recorrido funcional por app |
| Organization | Sí | Sí | datos demo presentes | Falta smoke funcional por superficies admin |
| Floor | Sí | Sí | tablas, visits, checks presentes | Falta recorrido táctil end-to-end |
| Reservations | Sí | Sí | reservas presentes | Falta validación live de flujos customer/host |
| Ordering | Sí | Sí | órdenes presentes | Falta recorrido waiter/cashier completo |
| Kitchen | Sí | Sí | commands presentes | Falta validación live de tablero KDS |
| Cash | Sí | Sí | sessions y movements presentes | Falta flujo live de cierre / conciliación |
| Fiscal | Sí | Sí | migraciones, asociación fiscal, WSAA y `FEDummy` real en homologación | matriz de comprobantes y rollout productivo pendientes |
| Workforce | Sí | Sí | repos Supabase presentes | Falta seed útil y prueba live |
| Catalog | Sí | Sí | wiring completo | Falta evidencia live por UI pública |
| Subscription | Sí | Sí | wiring completo | Falta prueba funcional de owner/backoffice |
| Audit | Sí | Sí | wiring completo | Falta explotación visible / consultas live |

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

## Cómo usar este inventario

Cuando abramos un nuevo bloque de implementación, conviene priorizar por esta secuencia:

1. dominios con wiring Supabase pero sin prueba live;
2. superficies UI que todavía no consumen esos flujos de punta a punta;
3. recién después, limpieza del fallback local y endurecimiento operativo.
