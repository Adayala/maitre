# Plan — SPEC-212

## Estado de implementación

La dirección visual por superficie y las capas CSS finales están implementadas. Las fases
siguientes no deben reemplazarlas masivamente: deben extraer la semántica estable, automatizar su
verificación y reducir duplicación con migraciones incrementales.

## Fase 1 — Fundaciones

1. Revisar ADR-004 y validar candidatos mediante SPK-05.
2. Definir tokens semánticos, temas y contrato de exportación.
3. Implementar CSS custom properties sin depender de un candidato no aprobado.
4. Configurar axe-core y reglas de accesibilidad; adoptar tooling visual sólo tras ADR-004.

## Fase 2 — Primitivas

1. Implementar únicamente primitivas de `i0-component-scope.md`.
2. Implementar feedback necesario para loading, vacío, error y sesión expirada.
3. Posponer overlays/componentes complejos hasta que un flujo aprobado los necesite.
4. Validar teclado, foco, lector de pantalla y targets táctiles.

## Fase 3 — Patrones operativos

1. App shell, skip link y contexto activo de Dash.
2. Login, selector de contexto y logout.
3. Estado de red, sesión, loading, vacío y recuperación de errores.
4. Posponer tablas y patrones operativos a sus incrementos funcionales.

## Fase 4 — Adopción y gobierno

1. Integrar el sistema por walking skeleton, no mediante migración masiva.
2. Publicar checklist de contribución y plantilla de revisión UX/a11y.
3. Medir accesibilidad, bundle y duplicación en CI.
4. Revisar tokens y componentes por evidencia de uso cada release mayor.

## Fase 5 — Consolidación posterior al rediseño por rol

1. Inventariar tokens repetidos entre `global.css` y `modern.css`.
2. Separar formalmente tokens de marca, tokens de producto y tokens operativos críticos.
3. Extraer sólo primitivas verificadas en al menos dos superficies.
4. Agregar baselines Playwright para login y pantalla principal de cada app.
5. Ejecutar axe, teclado, reflow 320 px y contraste antes de retirar estilos históricos.
