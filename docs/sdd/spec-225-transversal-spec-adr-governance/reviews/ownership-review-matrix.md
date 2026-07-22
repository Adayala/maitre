# Propuesta de ownership y revisión

Documento de Gate R0 para resolver findings de owner/reviewer sin asignar personas por inferencia.
Los nombres se incorporan sólo con aceptación explícita y autoridad real.

## Roles de gobernanza

| Rol | Responsabilidad | No implica |
| --- | --- | --- |
| Product Owner | alcance, prioridad, aceptación de valor y tradeoffs | aprobación técnica/fiscal/legal automática |
| Domain Owner | invariantes, contratos y consumidores de un dominio | custodiar secrets o autoaprobar cambios propios |
| Architecture Reviewer | boundaries, dependencias, portabilidad y ADRs | decidir requisitos legales |
| Security/Privacy Reviewer | threat model, RBAC, PII, secrets y abuse cases | ownership funcional del dominio |
| Platform Owner | Vercel/Supabase/CI, budgets, ambientes y runbooks | autoridad sobre reglas de negocio |
| Data Reviewer | schemas, migrations, lineage, retention y restore | aprobar modelos fiscales/laborales |
| UX/Accessibility Reviewer | journeys, WCAG, contenido y error states | autorizar APIs o permisos |
| Fiscal Reviewer | normativa, comprobantes, ARCA y Libro IVA | operar credenciales sin control técnico |
| Labor Reviewer | policy provenance y límites laborales | gestionar identidades/roles del sistema |
| Model Risk Reviewer | evals, sesgo, privacidad, automation y kill switch | aceptar costos o producto por sí solo |
| Provider Custodian | acceso administrativo/rotación de una cuenta externa | reviewer independiente del diseño que implementa |

Una persona puede cubrir varios roles en un equipo pequeño, pero cada decisión conserva el rol
ejercido. Para findings críticos de aislamiento, dinero, fiscalidad, empleo o automatización, el
autor único no registra `APPROVE` sobre su propio cambio.

## Matriz inicial por bloque

| Bloque | Specs | Owner requerido | Reviewers mínimos |
| --- | --- | --- | --- |
| Organization | 001–016 | Domain Owner Organization | Architecture + Security/Data |
| Identity | 017–026 | Domain Owner Identity | Security/Privacy + Architecture |
| Subscription | 027–036 | Product/Domain Owner | Architecture + Security |
| Catalog | 037–043 | Domain Owner Catalog | Product + Architecture |
| Audit/Dashboard | 044–048 | Domain Owner Platform/Product | Security/Privacy + UX |
| Floor | 049–065 | Domain Owner Operations | Product + Architecture |
| Reservations | 066–080 | Domain Owner Reservations | Product + Privacy |
| Ordering | 081–097 | Domain Owner Ordering | Operations + Architecture |
| Kitchen | 098–110 | Domain Owner Kitchen | Operations + Architecture |
| Workforce | 111–123 | Domain Owner Workforce | Privacy + Labor Reviewer |
| Cash | 124–136 | Domain Owner Cash | Security + Finance/Accounting reviewer |
| Fiscal/ARCA | 137–156 | Domain Owner Fiscal | Fiscal Reviewer + Security |
| Feedback/Reputation | 157–171 | Domain Owner Feedback | Privacy + Product/Model Risk |
| Integrations | 172–186 | Domain Owner Integrations | Security + Architecture/Provider |
| Analytics/AI | 187–206 | Domain Owner Data/AI | Privacy + Model Risk + Product |
| Platform | 207–224, 226 | Platform Owner | Architecture + Security + Data/UX según spec |
| Governance | 225 | Governance Owner | Product + Architecture; reviewer distinto del autor |

Los roles “Finance/Accounting”, “Fiscal” y “Labor” pueden requerir asesor externo competente. Si
no existe, la spec permanece `BLOCKED`; no se sustituye con una aprobación técnica.

## Segregación mínima

| Acción | Autor | Aprobador requerido |
| --- | --- | --- |
| Cambiar lifecycle/readiness schema | Governance/Platform | Architecture + Product |
| Aceptar ADR de plataforma | Architecture/Platform | Product + Security/Data según riesgo |
| Cambiar RBAC/tenant isolation | Domain/Identity | Security reviewer independiente |
| Activar producción ARCA | Fiscal/Platform | Fiscal + Security/Operations |
| Cambiar cálculo monetario/ledger | Domain owner | Finance/Accounting + tests dorados |
| Cambiar policy laboral | Workforce | Labor reviewer competente |
| Activar modelo/Autopilot | Data/AI | Model Risk + Product + Security |
| Aceptar excepción crítica | owner del riesgo | reviewer competente + vencimiento |

## Custodia Supabase/Vercel pendiente

Para la coordinación ya registrada con Adrian se necesita confirmar, sin guardar secretos:

- rol: `Provider Custodian` o también `Platform Owner` si lo acepta;
- organización/proyecto y ambiente que administra;
- quién puede vincular GitHub↔Vercel↔Supabase y quién puede desplegar producción;
- project refs/URLs no secretos y región;
- owners de variables, rotación, backups, budgets y offboarding;
- canal seguro para entregar valores sensibles directamente a Vercel/Supabase.

No se solicitan ni registran en Git: service-role key, database password, JWT secret, private
keys, access/refresh tokens o recovery codes. La custodia del provider no concede por sí sola
aprobación de ADR-002 ni de SPEC-210/214/220/226.

## Registro de asignación

Cada asignación debe incluir:

```yaml
scope: SPEC-NNN | DOMAIN:<name> | ADR-NNN
role: <rol de gobernanza>
assignee: <identidad verificable>
acceptedAt: <timestamp UTC>
effectiveFrom: <commit/ref>
backup: <identidad opcional>
expiresAt: <opcional para acceso temporal>
conflicts: [<declaraciones>]
```

El assignee confirma aceptación. Remover/cambiar responsable conserva historia y dispara revisión
de approvals pendientes; no invalida evidencia pasada firmada sobre un commit.

## Criterios de salida

- SPEC-207, 225 y 226 tienen owner/reviewer aceptados.
- ADR-002/003/004 tienen decision owner y reviewers competentes.
- Cada bloque de la matriz posee owner y reviewers mínimos o blocker explícito.
- Accesos de provider están separados de approvals y documentados sin secrets.
- El validador rechaza self-approval cuando la matriz exige segregación.
- Bus factor/backup y offboarding están documentados para plataforma y fiscalidad.
