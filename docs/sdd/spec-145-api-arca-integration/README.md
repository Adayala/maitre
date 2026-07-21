# [SPEC-145] Integración fiscal ARCA

Spike técnico para definir la integración de Maitre con los servicios fiscales oficiales de ARCA.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-145 |
| **Tipo** | Connector / API |
| **Dominio** | Billing & Tax |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | PROPOSED_FOR_REVIEW |
| **Resultado del spike** | COMPLETED |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | 4 |
| **Fecha de investigación** | 2026-07-21 |

## Resumen ejecutivo

- **Factura electrónica:** viable mediante los Web Services SOAP oficiales `WSAA` y `WSFEv1`.
- **Libro IVA Digital:** ARCA publica diseños de registro e importación TXT/ZIP mediante Portal IVA, pero no se encontró una API pública específica para generar o presentar el libro de forma automática.
- **Servicios complementarios útiles:** constatación de comprobantes (`WSCDCV1`) y consultas de padrón/constancia de inscripción.
- **Recomendación:** implementar primero emisión electrónica con `WSFEv1`; generar archivos de Libro IVA Digital y conciliaciones dentro de Maitre, manteniendo una presentación humana asistida en Portal IVA.

## Documentos

- [Objetivo y preguntas](objective.md)
- [Hallazgos técnicos](specification.md)
- [Arquitectura propuesta](structure.md)
- [Reglas y límites](rules.md)
- [Plan del spike/prototipo](plan.md)
- [Tareas](tasks.md)
- [Criterios de verificación](verification.md)
- [Notas y fuentes oficiales](notes.md)
