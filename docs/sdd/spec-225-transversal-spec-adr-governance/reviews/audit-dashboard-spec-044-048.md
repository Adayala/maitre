# Revisión de contratos — Audit & Dashboard SPEC-044–048

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-044–048 |
| Commit revisado | `fbffa8f` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Audit está correctamente planteado como append-only, redactado y tenant-scoped. Dashboard
deriva setup de fuentes autoritativas y modela partial/stale/unavailable sin fabricar ceros;
Dash conserva autorización server-side y requisitos WCAG 2.2 AA.

La aprobación queda bloqueada por gobernanza y por falta de semántica transaccional y de
integridad para AuditLog. Dashboard necesita además distinguir requisitos por entitlement y
su frontera frente a Analytics.

## Findings bloqueantes

### AUD-DASH-REV-001 — Owner/reviewer sin resolver

- Severidad: alta.
- Afecta: SPEC-044–048.
- Resolución: asignar responsables y registrar outcome contra commit exacto.

### AUD-DASH-REV-002 — Falla de auditoría sin semántica por operación

- Severidad: alta.
- Evidencia: SPEC-044 exige falla observable, pero no define cuándo una mutación sensible debe
  fallar cerrada si AuditLog/outbox no puede persistirse y cuándo puede continuar con recovery.
- Riesgo: cambios de roles, caja o fiscalidad podrían confirmarse sin evidencia exigida.
- Resolución: clasificar acciones, fijar atomicidad y recovery por clase, y probar caída antes,
  durante y después del commit.

### AUD-DASH-REV-003 — Integridad/tamper evidence incompleta

- Severidad: alta.
- Evidencia: append-only impide CRUD común, pero no especifica protección frente a actor DB
  privilegiado, cadena/hash, export firmado o reconciliación de gaps.
- Resolución: definir threat model, controles de integridad proporcionales al MVP, acceso de
  break-glass y verificación periódica portable.

## Findings medios

### AUD-DASH-REV-004 — Setup fiscal no condicionado por capacidad

SPEC-046 enumera FiscalEntity como parte del checklist general. Un tenant que todavía no usa
factura electrónica no debería quedar incompleto por una capacidad no habilitada. Derivar pasos
desde entitlements, país y flujo elegido, conservando reason codes deterministas.

### AUD-DASH-REV-005 — Overview y Analytics necesitan frontera explícita

SPEC-047 incluye métricas/alertas y puede solaparse con SPEC-193–200. Overview debe limitarse a
una proyección operativa acotada y enlazar analytics profundo, compartiendo definiciones sin
duplicar fórmulas.

### AUD-DASH-REV-006 — Soporte cross-tenant vuelve a carecer de boundary

SPEC-045 menciona rol de plataforma separado. Debe reutilizar el mismo contrato administrativo
resuelto por SUB-REV-003: step-up, motivo, actor real, alcance temporal y auditoría de acceso.

### AUD-DASH-REV-007 — Dependencias y journeys no serializados

Normalizar dependencias hacia Organization, Identity, Subscription, Analytics y SPEC-212/216.
Para Dash, fijar rutas y journeys I0 verificables sin convertir navegación en autorización.

## Evidencia positiva

- AuditLog no acepta create/update/delete público ni identidad de actor suministrada.
- Redacción excluye tokens, passwords, secretos y PII innecesaria.
- Cursor y orden estable contemplan consultas sin gaps.
- Setup se deriva y puede regresar al desconfigurar; no persiste progreso ficticio.
- Overview comunica `asOf`, freshness y degradación por sección.
- Errores parciales no se convierten en valores cero engañosos.
- Dash cubre teclado, foco, contraste, touch, responsive, axe y estados de error.
- Cache offline es read-only y comunica staleness.

## Próxima revisión

Revisar después de resolver AUD-DASH-REV-001–003 y documentar checklist capability-aware,
frontera operativa/analítica y soporte privilegiado. La evidencia debe cubrir audit failure,
gap detection, redacción por permiso, dashboard parcial y journeys accesibles I0.

La clasificación de operaciones, integridad/hash chain, soporte privilegiado, setup capability-aware,
frontera Overview/Analytics, dependencias y journeys están especificados en
[Contrato de autoridad Audit/Dashboard](../../spec-048-app-dash/audit-dashboard-authority-contract.md).
Los checks/evidencia continúan pendientes de ejecución y revisión humana.
