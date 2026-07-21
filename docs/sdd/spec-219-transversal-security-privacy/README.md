# [SPEC-219] Application Security, Privacy & Tenant Isolation

Contrato transversal de seguridad y privacidad para diseñar, implementar y verificar Maitre antes de operar datos reales.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-219 |
| **Tipo** | Transversal / Security Architecture |
| **Dominio** | Security / Privacy / Platform |
| **Estado** | DRAFT — READY FOR I0 REVIEW; PILOT GATE NOT APPROVED |
| **Prioridad** | P0 |
| **Fase** | Desde el walking skeleton; gate obligatorio antes del piloto |
| **Depende de** | SPEC-016, SPEC-023, SPEC-044–045, SPEC-207–218 |

## Decisiones centrales

- OWASP ASVS 5.0.0 nivel 2 como objetivo de verificación antes del piloto con datos reales.
- Threat model por trust boundary y cambio relevante.
- Autorización server-side y aislamiento tenant en aplicación, repositorios y RLS.
- Clasificación/minimización de datos desde la spec.
- Secure defaults, mínimo privilegio y deny-by-default.
- Supply chain y excepciones de seguridad verificadas en CI.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)
- [Threat model y datos I0](i0-threat-model.md)

I0 implementa únicamente controles del walking skeleton con datos sintéticos. ASVS L2 completo, revisión legal y controles fiscales/pagos siguen siendo gates del piloto, no evidencia del scaffold.
