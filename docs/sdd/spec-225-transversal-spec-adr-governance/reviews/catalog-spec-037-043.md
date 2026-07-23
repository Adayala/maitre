# Revisión de contratos — Catalog SPEC-037–043

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-037–043 |
| Commit revisado | `260fc72` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El diseño acierta al tratar Menu publicado como snapshot inmutable, separar configuración de
estado operativo y preservar precio/impuestos en OrderItem. Las APIs contemplan publicación
idempotente, concurrencia, scopes y aislamiento; RBAC separa edición, precio y publicación.

La aprobación queda bloqueada por ownership ausente y por ambigüedades en la identidad de
Product y en los modelos de disponibilidad y publicación.

## Findings bloqueantes

### CAT-REV-001 — Owner/reviewer sin resolver

- Severidad: alta.
- Afecta: SPEC-037–043.
- Resolución: asignar responsables y registrar outcome contra commit exacto.

### CAT-REV-002 — Identidad y reutilización de Product ambiguas

- Severidad: alta.
- Evidencia: Category pertenece a `menuRevisionId`; Product posee identidad/version propia,
  pero SPEC-038 prohíbe cruce de menú salvo una reutilización futura y SPEC-042 usa un endpoint
  global `/v1/products/{id}`.
- Riesgo: no queda claro si publicar clona Product, referencia una versión o lo embebe; esto
  afecta IDs, edits, snapshots, órdenes y deduplicación.
- Resolución: elegir aggregate boundary y modelo de revisionado, describir identidad lógica y
  física, y fijar cómo una revisión draft deriva de una publicada.

### CAT-REV-003 — Dos conceptos de disponibilidad sin nombres normativos

- Severidad: alta.
- Evidencia: SPEC-039 incluye `availability`, declara que disponibilidad operativa es una
  proyección separada y SPEC-042 permite gestionar “disponibilidad configurada”.
- Riesgo: consumidores pueden persistir como autoridad un estado operativo stale.
- Resolución: separar campos y contratos, por ejemplo elegibilidad/configuración publicada
  frente a disponibilidad operativa con `asOf`, precedencia y fuente autoritativa.

## Findings medios

### CAT-REV-004 — Publicación no define algoritmo atómico completo

Falta fijar qué versión recibe la identidad publicada, cómo se resuelven vigencias/scope en
colisión, qué pasa si falla media/tax validation y qué evento invalida caches. El command debe
producir snapshot completo y outbox en una transacción o compensación especificada.

### CAT-REV-005 — Tax category y reglas monetarias sin dependencia explícita

Product referencia `taxCategory`, pero el bloque no enlaza la autoridad fiscal SPEC-143/149/154
ni define si precio es neto o final. Antes de ordenar, publicación y cálculo deben compartir una
única convención versionada y verificable.

### CAT-REV-006 — Media references sin boundary

Faltan tipos, límites, lifecycle, sanitización y comportamiento ante asset ausente. Definir
referencias opacas y fallback accesible sin acoplar el dominio a Supabase Storage/Vercel.

### CAT-REV-007 — Dependencias no serializadas

Los README no declaran uniformemente Organization, Fiscal, Ordering, SPEC-088 y contratos
transversales. Normalizar metadata para validar ciclos, ruta crítica y consumidores públicos.

## Evidencia positiva

- Publicado es inmutable; cambios generan revisión y no alteran órdenes históricas.
- Money nunca usa float y currency debe ser coherente.
- Alérgenos incluyen provenance y no se presentan como garantía médica.
- Reorder es atómico y rechaza IDs faltantes, repetidos o cross-menu.
- Tenant/branch scopes se validan y no se aceptan como autoridad desde body.
- Create/PATCH/publish cubren idempotencia y optimistic concurrency.
- GUEST sólo accede al contrato público autorizado; draft leakage tiene pruebas negativas.
- No existe hard delete para contenido publicado o referenciado.

## Próxima revisión

Revisar luego de resolver CAT-REV-001–003 y documentar algoritmo de publicación, convención de
impuestos/precios y media port. La evidencia debe incluir fixtures de snapshot, publicación
concurrente, cache invalidation y consumo coherente por QR Menu y Ordering.

La identidad Product/MenuItem, disponibilidad, publicación atómica, tax/money, media port,
dependencias y permisos están especificados en
[Contrato de autoridad de Catalog](../../spec-043-rbac-catalog/catalog-authority-contract.md).
Owner/reviewer y aprobación permanecen bloqueados.
