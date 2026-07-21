# [SPEC-212] Design System & Accessibility

Contrato transversal para una experiencia React.js consistente, accesible, rápida y adecuada a la operación gastronómica.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-212 |
| **Tipo** | Transversal / UX Architecture |
| **Dominio** | Product / Frontend |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
| **Fase** | Antes del scaffolding de UI |
| **Depende de** | SPEC-207, SPEC-208, SPEC-209, SPEC-211 |

## Decisiones propuestas

| Área | Decisión |
| --- | --- |
| Accesibilidad | WCAG 2.2 AA como piso |
| Arquitectura | Tokens → primitivas → patrones → features |
| Estilos | CSS custom properties como fuente; Tailwind CSS como consumidor |
| Componentes complejos | HTML nativo primero; Radix UI cuando aporte comportamiento accesible |
| Íconos | Lucide React, siempre con nombre accesible cuando transmitan significado |
| Documentación visual | Storybook local y en CI, sin SaaS pago |
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
