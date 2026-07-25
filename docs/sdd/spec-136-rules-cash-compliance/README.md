# [SPEC-136] Cash Compliance Rules

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-136 |
| **Tipo** | Rules |
| **Dominio** | Cash |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | UNASSIGNED |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Fase** | 3 |

> **Nota de alcance (I0):** PLACEHOLDER ONLY. El motor de reglas de
> fraude/compliance de SPEC-136 (entidad `PolicyVersion` versionada con
> owner/provenance/thresholds/reviewer/fixtures, y un evaluador que produce
> `findings` con ruleId/ruleVersion/severidad/confidence/evidenceWindow/
> accessClassification para señales como fraccionamiento, diferencias reiteradas
> y autoaprobación) queda **diferido en su totalidad** para este walking skeleton.
> No se implementan entidad, evaluador, rutas ni tests; sólo un archivo stub
> documentando la decisión (`packages/modules/cash/src/domain/compliance-placeholder.ts`).
> No es una preocupación P0 para I0.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
