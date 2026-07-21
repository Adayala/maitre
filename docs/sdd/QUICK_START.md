# Quick Start — Spec-Driven Development

Comienza aquí si es tu primera vez con el SDD de Maitre.

## 5 minutos para entender

1. **Lee:** [`_guides/SPEC_FORMAT.md`](_guides/SPEC_FORMAT.md) — Estructura de una spec
2. **Mira:** [`spec-entity-tenant/`](spec-entity-tenant/) — Ejemplo completo (SPEC-001)
3. **Lista:** [`SPECS.md`](SPECS.md) — ~193 specs numeradas para el MVP

## Para escribir una spec

### 1. Elegir spec

```bash
# Abre SPECS.md, busca una spec PLANNED que te interese
# Ejemplo: SPEC-002 Brand Entity
```

### 2. Crear directorio

```bash
# Crear con número y nombre
mkdir -p /docs/sdd/spec-002-entity-brand
# O para API: spec-013-api-tenants
# O para evento: spec-014-event-tenant-created
```

### 3. Crear archivos

```bash
cd /docs/sdd/spec-002-entity-brand

# Copiar estructura de SPEC-001
cat > README.md << 'DOC'
# [SPEC-002] Brand Entity

[Copiar estructura de spec-entity-tenant/README.md y adaptar]
DOC

# Crear otros documentos
touch objective.md
touch specification.md
touch structure.md
touch rules.md
touch plan.md
touch tasks.md
touch verification.md
touch notes.md
```

### 4. Completar README.md

```markdown
# [SPEC-002] Brand Entity

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-002 |
| **Título** | Brand Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Status** | DRAFT |
| **Prioridad** | P0 |
| **Fase** | 1 |
| **Owner** | @tu-nombre |
| **Estimación** | XXh |

## Related Specs

**Dependencias:**
- [SPEC-001] Tenant Entity (debe estar DONE)

**Dependientes:**
- [SPEC-004] Branch Entity
- ...
```

### 5. Completar objective.md

```markdown
# Objetivo — SPEC-002

## Propósito

[1-2 párrafos sobre qué es Brand, por qué importa]

## Criterios de aceptación

- [ ] **CAD-1:** [Criterio específico verificable]
  - Cómo se verifica: [pasos]
  
- [ ] **CAD-2:** ...
```

### 6. Completar otros documentos

Seguir template en [`_guides/SPEC_FORMAT.md`](_guides/SPEC_FORMAT.md).

### 7. Marcar como READY

Cuando todos los documentos estén completos:

```markdown
## Status tracking (en README.md)

- [x] objective.md completado
- [x] specification.md completado
- [x] structure.md completado
- [x] rules.md completado
- [x] plan.md completado
- [x] tasks.md completado
- [x] verification.md completado
- [x] notes.md completado
- [x] Peer review completado
- [x] Status: READY_FOR_IMPLEMENTATION
```

Actualizar [`SPECS.md`](SPECS.md):

```markdown
- [x] **SPEC-002** | Brand Entity | Entity | Organization | Fase 1 | P0 | READY_FOR_IMPLEMENTATION
```

## Estructura de una spec (resumen)

```
spec-NNN-name/
├── README.md             (metadata, links)
├── objective.md          (propósito, criterios de aceptación)
├── specification.md      (schema, reglas)
├── structure.md          (detalles del schema)
├── rules.md              (invariantes, transiciones)
├── plan.md               (cómo se implementa)
├── tasks.md              (pasos concretos)
├── verification.md       (cómo se prueba, tests)
└── notes.md              (asunciones, riesgos, decisiones)
```

## Lectura recomendada (en orden)

1. Este archivo (QUICK_START.md)
2. [`_guides/SPEC_FORMAT.md`](_guides/SPEC_FORMAT.md)
3. [`spec-entity-tenant/README.md`](spec-entity-tenant/README.md)
4. [`spec-entity-tenant/objective.md`](spec-entity-tenant/objective.md)
5. [`spec-entity-tenant/specification.md`](spec-entity-tenant/specification.md)
6. [`SPECS.md`](SPECS.md) — Elegir qué escribir

## Files importantes

| Archivo | Propósito |
| --- | --- |
| [`QUICK_START.md`](QUICK_START.md) | Tú estás aquí — comienza aquí |
| [`SPECS.md`](SPECS.md) | Catálogo numerado de 193 specs |
| [`_guides/SPEC_FORMAT.md`](_guides/SPEC_FORMAT.md) | Estructura completa de una spec |
| [`_guides/SPEC_STRUCTURE.md`](_guides/SPEC_STRUCTURE.md) | Tipos de specs y sus documentos |
| [`spec-entity-tenant/`](spec-entity-tenant/) | Ejemplo completo (SPEC-001) |
| [`START_HERE.md`](START_HERE.md) | Overview de todo (más detallado) |

## FAQ

**P: ¿Cuánto tiempo toma escribir una spec?**
R: 2-4 horas. Depende de complejidad. Una entidad simple: 2h. Una API compleja: 4h.

**P: ¿Cuándo está "lista" una spec?**
R: Cuando TODO tiene respuesta:
- Qué es (objetivo)
- Cómo se ve (specification)
- Cómo se implementa (plan, tasks)
- Cómo se prueba (verification)
- Qué suposiciones/riesgos tiene (notes)

**P: ¿Qué pasa después de escribir una spec?**
R: Peer review → READY_FOR_IMPLEMENTATION → Dev la implementa contra la spec → Tests la validan → DONE.

**P: ¿Puedo cambiar una spec después de escribirla?**
R: Sí. Documenta el cambio en notes.md → Historial de cambios → Pedir peer review de nuevo.

**P: ¿Qué pasa si no completo una spec?**
R: Queda en DRAFT. Otros pueden tomar la torch y completarla. La status está en README.md.

## Checklist para tu primera spec

- [ ] Elegí una spec en SPECS.md (status PLANNED)
- [ ] Creé directorio `/docs/sdd/spec-XXX-name/`
- [ ] Copié template de SPEC-001
- [ ] Completé README.md con mi spec
- [ ] Escribí objective.md (propósito + criterios)
- [ ] Escribí specification.md (schema + reglas)
- [ ] Escribí plan.md (cómo implementar)
- [ ] Escribí tasks.md (pasos concretos)
- [ ] Escribí verification.md (cómo probar)
- [ ] Escribí notes.md (decisiones + riesgos)
- [ ] Actualicé SPECS.md (marqué como READY)
- [ ] Pedí peer review
- [ ] Recibí feedback
- [ ] Status: READY_FOR_IMPLEMENTATION ✅

---

**Listo para comenzar?** 👉 Abre [`SPECS.md`](SPECS.md) y elige tu primera spec.
