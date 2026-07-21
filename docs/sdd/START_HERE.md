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
│   ├── 00-mvp-roadmap.md      Listado de ~193 specs para MVP
│   ├── 01-priority-todo.md    Checklist ordenado por prioridad
│   ├── 15-apps.md             Las 6 apps, dispositivos, mobile-first
│   ├── 16-apis.md             Contratos HTTP formales
│   └── 17-events.md           Eventos del sistema
│
├── INDEX.md                    Índice maestro de todas las specs
│
└── spec-[type]-[name]/         Directorio de cada spec individual
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

### Para ver un ejemplo completo

1. Abre [`spec-entity-tenant/`](spec-entity-tenant/)
2. Lee en orden: `README.md` → `structure.md` → `rules.md`

### Para escribir una nueva spec

1. Lee [`_guides/01-priority-todo.md`](_guides/01-priority-specs-todo.md) y elige una
2. Crea directorio: `mkdir -p spec-[type]-[name]`
3. Copia estructura de `spec-entity-tenant/`
4. Sigue formato en [`_guides/SPEC_STRUCTURE.md`](_guides/SPEC_STRUCTURE.md)
5. Actualiza [`INDEX.md`](INDEX.md)

### Para ver todas las specs

Abre [`INDEX.md`](INDEX.md) — listado completo con checkboxes.

---

## Mapa mental

```
Especificaciones SDD (este directorio)
├── Guías y recursos (_guides/)
├── Índice maestro (INDEX.md)
└── Specs individuales (spec-type-name/)
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
| Entender Tenant | Abrir `spec-entity-tenant/` |
| Listar todas las specs | Abrir `INDEX.md` |
| Escribir una spec nueva | Copiar estructura de `spec-entity-tenant/` |
| Entender cómo se crean apps | Leer `_guides/15-applications-and-devices.md` |
| Ver APIs que usa cada app | Leer `_guides/16-api-specifications.md` |
| Entender cómo se comunican dominios | Leer `_guides/17-event-specifications.md` |

---

## Stats

- **Total MVP:** ~193 specs (Fases 1-5)
- **Fase 1 (crítica):** ~48 specs (dominio de producto)
- **Fase 2 (operación):** ~60 specs (mozo, cocina)
- **Fase 3 (cliente):** ~35 specs (reserva, guest app)
- **Fase 4 (dinero):** ~25 specs (caja, pagos)
- **Fase 5 (integración):** ~30 specs (reputación, conectores)

---

## Filosofía

> Escribimos qué hace el sistema *antes* de cómo lo hace.

Las specs son **contratos**, no código. Un backend dev implementa contra la spec. Un frontend dev llama a las APIs según la spec. Un tester verifica contra la spec.

Si una spec y el código divergen, la spec gana. (O la spec se actualiza si el cambio es autorizado.)

---

## Próximos pasos

```
✅ Infraestructura SDD lista (directorios, templates, índice)
👉 Escribir specs de Fase 1 (~48 specs)
   • Comenzar por Organization (13 specs)
   • Luego Identity (12 specs)
   • Luego Subscription (10 specs)
🔲 Escribir specs de Fase 2 en paralelo
🔲 Implementación siguiendo las specs
```

---

## Contacto y cambios

- **Cambio en una spec:** Actualiza el directorio y comenta en `INDEX.md`
- **Duda sobre estructura:** Revisa `_guides/SPEC_STRUCTURE.md`
- **Pregunta abierta:** Agrega a `_guides/01-priority-todo.md` como nota

---

**¡Bienvenido a SDD!** Empezamos escribiendo qué hace Maitre, antes de escribir código.
