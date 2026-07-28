# [SPEC-212] Design System & Accessibility

Contrato transversal para una experiencia React.js consistente, accesible, rápida y adecuada a la operación gastronómica.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-212 |
| **Tipo** | Transversal |
| **Subtype** | UX Architecture |
| **Dominio** | Product / Frontend |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Blockers** | Tooling pendiente de ADR-004 y SPK-05; asignar owner y reviewer |
| **Prioridad** | P0 |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
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

## Estado incremental — 28 de julio de 2026

- Las seis superficies ya tienen una dirección visual explícita y diferenciada por rol.
- Customer consume la presentación pública del tenant; las apps operativas preservan tokens
  críticos de foco, contraste y estado por encima de variaciones de marca.
- Waiter, Host, Kitchen, Cashier y Dash cargan una capa final `styles/modern.css`.
- Los builds Vite/TypeScript y una revisión visual manual responsive fueron completados y las
  superficies están desplegadas en Vercel.
- Permanecen pendientes la extracción a `packages/design-tokens`/`packages/ui`, axe-core,
  screenshots automatizados y el cierre formal de ADR-004/SPK-05.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)
- [Alcance de componentes I0](i0-component-scope.md)
