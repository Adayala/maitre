# Revisión de contratos — Organization SPEC-001–016

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-001–016 |
| Commit revisado | `132f130` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Los contratos forman un límite coherente de Organization: Tenant es raíz de aislamiento;
Brand, FiscalEntity, Branch, Salon y Table separan identidad comercial, fiscal y física; las
APIs aplican contexto server-side, idempotencia y concurrencia; los eventos usan outbox; RBAC
niega por defecto. No se detectó acoplamiento obligatorio a Vercel, Supabase ni un ORM.

El bloque no puede aprobarse porque falta gobernanza humana y existe drift de metadata frente
al contrato actual de SPEC-225. Estos findings no invalidan los contratos de dominio, pero sí
impiden promoverlos automáticamente.

## Findings bloqueantes

### ORG-REV-001 — Owner/reviewer sin resolver

- Severidad: alta.
- Afecta: SPEC-001, SPEC-003–016; SPEC-002 aún no tiene reviewer.
- Evidencia: metadata `UNASSIGNED` y blockers explícitos o implícitos.
- Criterio: entrada y resultado del protocolo de revisión SPEC-225.
- Resolución: asignar owner y reviewer con autoridad; registrar outcome contra commit exacto.

### ORG-REV-002 — Readiness no canónico

- Severidad: alta.
- Afecta: SPEC-001–004.
- Evidencia: `WALKING_SKELETON_I0` no pertenece al enum documentado por el contrato vigente
  de registro (`NOT_ASSESSED`, `PROPOSED_FOR_REVIEW`, `READY_FOR_I0_REVIEW`, `BLOCKED`).
- Riesgo: tooling y humanos pueden interpretar estados distintos para la misma spec.
- Resolución: adoptar el valor en schema/fixtures/documentación o migrar los README a un valor
  canónico; no corregir sólo una proyección.

### ORG-REV-003 — Lifecycle adelantado a la aprobación

- Severidad: alta.
- Afecta: SPEC-001–004.
- Evidencia: `Estado: IN_PROGRESS` mientras la revisión carece de reviewer y autoridad explícita.
- Riesgo: contradice la regla de que sólo `READY_FOR_IMPLEMENTATION` habilita comportamiento
  nuevo y vuelve ambigua la evidencia de autorización.
- Resolución: reconstruir la decisión que habilitó el trabajo o normalizar lifecycle mediante
  el procedimiento de SPEC-225, preservando historial.

## Findings medios

### ORG-REV-004 — Dependencias no serializadas uniformemente

Las relaciones aparecen como texto libre o secciones históricas, pero gran parte de SPEC-001–016
no posee `Depende de` autoritativo. Esto impide validar ciclos y ruta crítica de forma
determinista. Normalizar metadata junto con schema/baseline, sin inferir dependencias desde el
nombre del directorio.

### ORG-REV-005 — Navegación incompleta hacia contratos

SPEC-001–004 poseen `contract.md`, pero sus listas principales de documentos no lo enlazan de
forma uniforme. El contrato existe y es auditable por ruta, aunque su descubribilidad humana es
menor. Agregar enlaces sólo cuando no colisione con la normalización/generación del registro.

## Evidencia positiva

- Tenant es autoridad de aislamiento y `tenantId` no es reasignable.
- Brand, FiscalEntity y Branch evitan responsabilidades duplicadas.
- Estado operativo de Table se deriva; no se mezcla con CRUD de configuración.
- APIs rechazan autoridad, IDs e importes sensibles suministrados por cliente cuando aplica.
- Create/comandos reintentables definen idempotencia; PATCH usa `If-Match`.
- Eventos distinguen una intención lógica de entregas físicas duplicadas.
- Payloads evitan CUIT, dirección, contactos, credenciales y snapshots innecesarios.
- RBAC cubre tenant, branch scope, self-grant, confused deputy y revocación.
- Casos de timezone/DST, cuota, concurrencia, rollback y cross-tenant están especificados.

## Próxima revisión

Revisar nuevamente después de resolver ORG-REV-001–003 y de elegir una estrategia única para
metadata histórica. El reviewer debe comprobar además compatibilidad con Identity SPEC-017–026,
Subscription SPEC-027–036 y los contratos transversales SPEC-207–225 antes de emitir `APPROVE`.
