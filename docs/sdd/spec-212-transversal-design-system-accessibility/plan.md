# Plan — SPEC-212

## Fase 1 — Fundaciones

1. Aprobar la spec y registrar el ADR de UI.
2. Definir tokens semánticos, temas y contrato de exportación.
3. Configurar Tailwind CSS para consumir CSS custom properties.
4. Configurar Storybook, axe-core y reglas de accesibilidad de ESLint.

## Fase 2 — Primitivas

1. Implementar tipografía, iconografía, Button, Link, Input, Select, Checkbox y Radio.
2. Implementar feedback: Alert, Toast, Progress, Skeleton y estados vacíos.
3. Implementar overlays accesibles sólo donde HTML nativo no alcance.
4. Validar teclado, foco, lector de pantalla y targets táctiles.

## Fase 3 — Patrones operativos

1. App shell, navegación, contexto activo y permisos visibles.
2. Estado de red/sincronización y recuperación de errores.
3. Formularios, filtros, tablas responsive y confirmaciones críticas.
4. Patrones de Kitchen, Floor y Cash validados en dispositivos objetivo.

## Fase 4 — Adopción y gobierno

1. Integrar el sistema por walking skeleton, no mediante migración masiva.
2. Publicar checklist de contribución y plantilla de revisión UX/a11y.
3. Medir accesibilidad, bundle y duplicación en CI.
4. Revisar tokens y componentes por evidencia de uso cada release mayor.
