# Contrato de estructura y boundaries — SPEC-225

## Propósito

`structure.md` define dónde vive una responsabilidad, qué datos/decisiones posee y qué dependencias
puede atravesar. No es un árbol de archivos anticipado ni una implementación disfrazada.

## Identidad

Formato:

```text
SPEC-NNN-BND-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos y no se reutiliza.
- Un boundary representa una frontera de responsabilidad o autoridad estable.

Ejemplo:

```markdown
## SPEC-010-BND-001 — Organization HTTP boundary
```

Componentes internos pueden documentarse sin ID estable hasta que sean consumidos externamente o
posean lifecycle independiente.

## Schema lógico

```yaml
id: SPEC-NNN-BND-MMM
name: <nombre>
responsibility: <qué decide/hace>
owns: [<datos, invariantes, contratos>]
doesNotOwn: [<exclusiones>]
inputs: [<puertos/contratos>]
outputs: [<puertos/eventos>]
allowedDependencies: [<boundaries/specs>]
forbiddenDependencies: [<boundaries/capas>]
failureSemantics: <errores/degradación>
securityScope: <tenant/branch/PII/permissions>
requirementRefs: [SPEC-NNN-REQ-MMM]
```

## Autoridad

`owns` significa autoridad para validar y cambiar una decisión/dato. Almacenar, cachear o mostrar una
copia no transfiere ownership.

Cada concepto normativo posee una autoridad primaria. Proyecciones y réplicas declaran source,
freshness y reconciliación.

## Dirección de dependencias

Las dependencias apuntan hacia contratos/puertos estables, no hacia detalles de framework o
proveedor. Un boundary de dominio no depende de HTTP, UI, ORM o SDK externo.

Se documentan:

- dependencias permitidas directas;
- dependencias prohibidas;
- inversión mediante puerto/adaptador;
- datos cruzados y consistencia;
- efecto de indisponibilidad.

Una referencia conceptual a otra spec no crea automáticamente dependencia de runtime.

## Datos y multi-tenancy

Todo boundary que procesa datos tenant/branch-scoped declara:

- fuente del tenant context;
- branch scope aplicable;
- claves/constraints de pertenencia;
- autorización previa;
- redacción y clasificación;
- comportamiento cross-tenant negativo.

El `branchId` no sustituye `tenantId`, según el contrato de jerarquía organizacional.

## Interfaces y fallos

Inputs/outputs enlazan contratos versionados. Failure semantics especifica timeout, retry,
idempotencia, partial failure y fallback cuando apliquen.

No se documenta un proveedor como boundary autoritativo si existe un puerto propio. El adapter
declara capacidades y pérdida semántica.

## Estructura documental versus estructura de solución

Un `structure.md` puede comenzar como esqueleto documental para declarar artefactos y dependencias de
documentación. Ese estado se clasifica:

```text
DOCUMENT_SKELETON
```

No satisface diseño estructural ni readiness de implementación. Para pasar a:

```text
SOLUTION_BOUNDARIES_DEFINED
```

debe poseer boundaries, autoridad, dependencias, fallos, seguridad y trazabilidad revisados.

## Línea base

- 226 archivos `structure.md`.
- 0 con IDs propios `SPEC-NNN-BND-MMM`.
- 22 contienen lenguaje detectable de dependencias.
- 23 contienen lenguaje detectable de ownership/autoridad.
- SPEC-207–226 poseen 20 esqueletos genéricos `DOCUMENT_SKELETON`; completan el artefacto base, no el
  diseño de solución.

Los conteos textuales orientan revisión y no prueban calidad por sí solos.

## Migración

1. Identificar autoridades y responsabilidades reales.
2. Separar boundary de componente/archivo.
3. Declarar owns/doesNotOwn.
4. Asignar IDs estables.
5. Documentar puertos, dirección y prohibiciones.
6. Añadir tenancy, fallos y seguridad.
7. Enlazar requisitos y contratos.
8. Revisar antes de marcar `SOLUTION_BOUNDARIES_DEFINED`.

## Criterios de salida

- [ ] Las specs implementables poseen boundaries identificables.
- [ ] Cada dato/decisión tiene autoridad primaria.
- [ ] Dependencias permitidas/prohibidas son explícitas.
- [ ] Boundaries tenant-scoped declaran aislamiento.
- [ ] Los 20 esqueletos transversales fueron refinados o permanecen bloqueados.

Los checks permanecen abiertos.
