# Objetivo — SPEC-155

Definir la autoridad de puntos de venta fiscales y la serialización segura de numeración para emisión
sin reutilización, saltos ciegos ni duplicados ante timeouts ambiguos.

## Criterios de aceptación

### CAD-155-01 — FiscalPointOfSale queda identificado por scope oficial y checkpoint por tipo

FiscalPointOfSale queda identificado por fiscal entity, environment y official code, con
voucher types, vigencia, estado y checkpoint remoto por tipo.

### CAD-155-02 — La numeración se serializa por pointOfSale + voucherType sin intents incompatibles

la numeración se serializa por pointOfSale + voucherType y no permite dos intents activos
incompatibles para la misma secuencia.

### CAD-155-03 — AuthorizationIntent conserva candidate number e identidad idempotente estable

AuthorizationIntent conserva candidate number e identidad idempotente estable hasta
resolución final.

### CAD-155-04 — Timeout ambiguo bloquea avance hasta reconciliación sin reutilizar números

timeout o incertidumbre bloquea la siguiente reserva hasta consultar/reconciliar con ARCA;
nunca se reutiliza número ni se consume otro a ciegas.

### CAD-155-05 — Sólo el último autorizado remoto actualiza checkpoint; divergencias bloquean

sólo el último autorizado remoto actualiza el checkpoint; divergencias producen
`BLOCKED_RECONCILIATION` con runbook explícito.

### CAD-155-06 — La aprobación exige evidencia de serialización, timeout ambiguo y divergencia

La aprobación exige fixtures de serialización, concurrencia, timeout ambiguo, divergencia
remota, vigencias y reintentos idempotentes.
