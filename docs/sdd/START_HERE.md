# SDD — Spec-Driven Development

<p align="center">
  <img src="../assets/branding/maitre-logo.png" alt="Logo de Maitre" width="640">
</p>

Bienvenido a las especificaciones ejecutables de Maitre.

## Qué es SDD

**Spec-Driven Development** es escribir especificaciones formales *antes* de implementación. Las specs son:

- **Ejecutables:** Se pueden verificar sin código
- **Vivas:** Se actualizan con el proyecto
- **Contratos:** Son acuerdos entre equipos
- **Independientes de implementación:** Describen comportamiento; el perfil técnico vigente se documenta aparte

## Estructura

```
/docs/sdd/
├── _guides/                    Documentos transversales y recursos
│   ├── README.md              Introducción a las specs
│   ├── SPEC_STRUCTURE.md      Cómo se organiza cada spec
│   ├── 00-mvp-specifications-roadmap.md  Roadmap histórico de specs
│   ├── 01-priority-specs-todo.md         Checklist histórico de prioridad
│   ├── 15-applications-and-devices.md    Apps, dispositivos y mobile-first
│   ├── 16-api-specifications.md          Contratos HTTP
│   └── 17-event-specifications.md        Eventos del sistema
│
├── INDEX.md                    Índice maestro de todas las specs
│
└── spec-NNN-[type]-[name]/     Directorio numerado de cada spec individual
    ├── README.md              Propósito, metadata, links relacionados
    ├── structure.md           Schema, campos, tipos
    ├── rules.md               Invariantes y reglas de negocio
    ├── lifecycle.md           Ciclo de vida (si aplica)
    ├── examples.md            Ejemplos JSON concretos
    ├── api-*.md               Detalles de cada endpoint (si es API)
    ├── events-*.md            Detalles de cada evento
    └── [otros].md             Según el tipo de spec
```

## Empezar

### Para entender SDD

1. Lee [`_guides/README.md`](_guides/README.md)
2. Mira [`_guides/SPEC_STRUCTURE.md`](_guides/SPEC_STRUCTURE.md)
3. Revisa [`TECH_STACK.md`](TECH_STACK.md) para la implementación vigente con React.js, Node.js y Vercel
4. Aplica [`SPEC-207`](spec-207-transversal-engineering-quality/) para calidad y gates SDD
5. Aplica [`SPEC-208`](spec-208-transversal-zero-cost-mvp/) para operar el MVP dentro de free tiers
6. Usa [`SPEC-209`](spec-209-transversal-monorepo-architecture/) para crear el monorepo y respetar sus límites
7. Aplica [`SPEC-210`](spec-210-transversal-data-identity-platform/) para PostgreSQL, identidad y almacenamiento con Supabase
8. Aplica [`SPEC-211`](spec-211-transversal-implementation-toolchain/) para el toolchain React.js/Node.js y sus verificaciones
9. Aplica [`SPEC-212`](spec-212-transversal-design-system-accessibility/) para UI consistente, responsive y accesible
10. Implementa [`SPEC-213`](spec-213-transversal-mvp-walking-skeleton/) como primer corte vertical desplegable
11. Aplica [`SPEC-214`](spec-214-transversal-environments-configuration-secrets/) para ambientes, configuración y secretos
12. Usa [`SPEC-215`](spec-215-transversal-http-api-standards/) como contrato común de todas las APIs HTTP
13. Aplica [`SPEC-216`](spec-216-transversal-observability-reliability/) para observabilidad, SLOs y recuperación
14. Usa [`SPEC-217`](spec-217-transversal-events-async-processing/) para eventos, outbox y procesamiento asíncrono
15. Aplica [`SPEC-218`](spec-218-transversal-offline-sync/) para operación offline y sincronización
16. Verifica [`SPEC-219`](spec-219-transversal-security-privacy/) para seguridad, privacidad y aislamiento multi-tenant
17. Aplica [`SPEC-220`](spec-220-transversal-data-lifecycle-disaster-recovery/) para ciclo de vida, backups y disaster recovery
18. Usa [`SPEC-221`](spec-221-transversal-ci-cd-release-management/) para CI/CD, promoción y releases recuperables
19. Ejecuta [`SPEC-222`](spec-222-transversal-mvp-scope-delivery-plan/) para mantener alcance y secuencia del MVP
20. Aplica [`SPEC-223`](spec-223-transversal-realtime-state-distribution/) para actualización live de Floor y Kitchen
21. Usa [`SPEC-224`](spec-224-transversal-testing-test-data/) para estrategia de tests y datos sintéticos
22. Aplica [`SPEC-225`](spec-225-transversal-spec-adr-governance/) para lifecycle, aprobación y ADRs
23. Revisa [`I0_READINESS_REVIEW.md`](I0_READINESS_REVIEW.md) antes de iniciar scaffolding
24. Resuelve [`I0_FUNCTIONAL_CONTRACT_REVIEW.md`](I0_FUNCTIONAL_CONTRACT_REVIEW.md) para alinear Tenant, User, Membership y Auth
25. Ejecuta [`SPEC-226`](spec-226-transversal-i0-platform-validation-spikes/) para decidir Supabase y toolchain con evidencia

### Para ver un ejemplo completo

1. Abre [`SPEC-001 — Tenant`](spec-001-entity-tenant/)
2. Lee en orden: `README.md` → `structure.md` → `rules.md`

### Para escribir una nueva spec

1. Confirma necesidad, alcance y dependencias en el roadmap/spec correspondiente.
2. Reserva un ID único e inmutable según [`SPEC-225`](spec-225-transversal-spec-adr-governance/registry-contract.md).
3. Crea `spec-NNN-[type]-[name]/` con el paquete mínimo definido por SPEC-225.
4. Declara metadata, `Estado: DRAFT`, readiness, owner/reviewer y blockers reales.
5. Regenera catálogo/índice cuando exista tooling; mientras tanto valida links e identidad en el mismo cambio.
6. No marques `READY_FOR_IMPLEMENTATION` hasta completar review y aprobaciones.

### Para ver todas las specs

Abre [`INDEX.md`](INDEX.md) — listado completo con checkboxes.

---

## Mapa mental

```
Especificaciones SDD (este directorio)
├── Guías y recursos (_guides/)
├── Índice maestro (INDEX.md)
└── Specs individuales (spec-NNN-type-name/)
    ├── README.md (qué es, links, metadata)
    ├── estructura (schema, campos, tipos)
    ├── comportamiento (reglas, máquinas de estado)
    ├── integración (APIs, eventos, RBAC)
    └── ejemplos (JSON, casos de uso)
```

Cada spec es **autocontendida** — todo lo que necesitas sobre una entidad/API/evento vive en su directorio.

---

## Quick reference

| Necesito… | Voy a… |
| --- | --- |
| Entender cómo funcionan las specs | Leer `_guides/README.md` |
| Ver estructura de una spec | Leer `_guides/SPEC_STRUCTURE.md` |
| Saber qué specs escribir primero | Leer `_guides/01-priority-todo.md` |
| Entender Tenant | Abrir `spec-001-entity-tenant/` |
| Listar todas las specs | Abrir `INDEX.md` |
| Escribir una spec nueva | Aplicar el paquete mínimo y registro de SPEC-225 |
| Entender cómo se crean apps | Leer `_guides/15-applications-and-devices.md` |
| Ver APIs que usa cada app | Leer `_guides/16-api-specifications.md` |
| Entender cómo se comunican dominios | Leer `_guides/17-event-specifications.md` |

---

## Conteos

Los conteos de specs, estados y readiness deben derivarse del registro definido por
SPEC-225. No se mantienen cifras manuales en esta guía porque divergen cuando se agrega,
depreca o reemplaza una spec. Hasta implementar el catálogo generado, `INDEX.md` es una
vista histórica útil pero no la fuente autoritativa de metadata.

---

## Filosofía

> Escribimos qué hace el sistema *antes* de cómo lo hace.

Las specs son **contratos**, no código. Un backend dev implementa contra la spec. Un frontend dev llama a las APIs según la spec. Un tester verifica contra la spec.

Si una spec y el código divergen, la spec gana. (O la spec se actualiza si el cambio es autorizado.)

---

## Próximos pasos

```
✅ Contratos transversales I0 y gobernanza SDD documentados
👉 Asignar owners/reviewers y completar review del subset I0
🔲 Ejecutar SPEC-226 y resolver ADR-002/003/004 con evidencia
🔲 Implementar `npm run sdd:validate` y regenerar el índice
🔲 Aprobar únicamente las specs necesarias para el walking skeleton
🔲 Crear el scaffold e implementar I0 contra revisiones aprobadas
```

---

## Contacto y cambios

- **Cambio en una spec:** Actualiza su README autoritativo y las proyecciones afectadas
- **Duda sobre estructura:** Revisa `_guides/SPEC_STRUCTURE.md`
- **Pregunta abierta:** Regístrala en `notes.md` y márcala como blocker cuando sea P0

---

**¡Bienvenido a SDD!** Empezamos escribiendo qué hace Maitre, antes de escribir código.
