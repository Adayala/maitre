# [SPEC-212] Design System & Accessibility

Contrato transversal para una experiencia React.js consistente, accesible, rápida y adecuada a la operación gastronómica.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-212 |
| **Tipo** | Transversal / UX Architecture |
| **Dominio** | Product / Frontend |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Blockers** | Tooling pendiente de ADR-004 y SPK-05 |
| **Prioridad** | P0 |
| **Fase** | Antes del scaffolding de UI |
| **Depende de** | ADR-004, SPEC-207–209, SPEC-211, SPEC-213, SPEC-224, SPEC-226 |

## Decisiones y candidatos

| Área | Decisión |
| --- | --- |
| Accesibilidad | WCAG 2.2 AA como piso |
| Arquitectura | Tokens → primitivas → patrones → features |
| Estilos | CSS custom properties como fuente; Tailwind CSS candidato como consumidor |
| Componentes complejos | HTML nativo primero; Radix UI candidato sólo cuando aporte comportamiento |
| Íconos | SVG/icon adapter propio; Lucide React candidato |
| Documentación visual | Storybook candidato local/CI, sin SaaS pago |
| Pruebas | Testing Library + axe-core + Playwright |
| Regresión visual | Screenshots de Playwright en CI, sin Chromatic |
| Idioma inicial | Español de Argentina, textos externalizados |

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)
- [Alcance de componentes I0](i0-component-scope.md)
