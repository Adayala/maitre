# Objetivo — SPEC-054

## Propósito

ServicePeriod representa una jornada operativa dentro de una Branch, como desayuno,
almuerzo o cena. No representa un producto, cargo, cobertura ni servicio de suscripción.

## Resultado esperado

### CAD-054-01 — ServicePeriod conserva identidad operativa y calendario local coherentes

Cada ServicePeriod identifica tenant, Branch, businessDate local, timezone IANA, tipo,
ventana planificada y revisión de política.

### CAD-054-02 — El ciclo del período operativo es explícito y acotado

El ciclo es `PLANNED → OPEN → CLOSING → CLOSED`; sólo PLANNED puede cancelarse
ordinariamente.

### CAD-054-03 — La política de solapamiento decide aperturas concurrentes

La ServicePeriodPolicyVersion decide solapamientos; por defecto no existen dos períodos
OPEN/CLOSING simultáneos en una Branch.

### CAD-054-04 — El cierre del período bloquea nuevas operaciones sin absorber otras autoridades

begin-close bloquea nuevas Visits y close evalúa Visits, CashSessions y Payments
pendientes sin alterar sus autoridades.

### CAD-054-05 — Timeout y force-close preservan trazabilidad y límites de autoridad

timeout conserva CLOSING; force-close exige permiso, reason y findings, y nunca declara
operaciones ajenas como completadas.

### CAD-054-06 — La aprobación exige evidencia temporal, concurrente y operativa suficiente

La aprobación exige fixtures de DST, business date, concurrencia, pendientes, force-close,
idempotencia y aislamiento.
