# Verificación — SPEC-212

## Gates automáticos

- ESLint sin errores, incluyendo JSX a11y.
- TypeScript estricto sin errores.
- Tests unitarios y de interacción aprobados.
- axe-core sin violaciones en componentes y páginas cubiertas.
- Playwright aprueba navegación por teclado y flujos críticos.
- Screenshots representativos no cambian sin aprobación explícita.
- Baseline y delta de bundle por candidato UI registrados antes de ADR-004.

## Checklist manual por flujo crítico

- [ ] Se completa sólo con teclado y el foco siempre es visible.
- [ ] Se completa con lector de pantalla y nombres/estados son comprensibles.
- [ ] Funciona con zoom 200 % y reflow de 320 CSS px.
- [ ] Mantiene contraste mínimo y no depende sólo de color.
- [ ] Targets operativos alcanzan 44×44 CSS px.
- [ ] Respeta reducción de movimiento.
- [ ] Errores permiten identificar, corregir y conservar la entrada.
- [ ] Offline, sincronización y recuperación son explícitos.
- [ ] Se prueba en el dispositivo/contexto primario de la app.

## Criterios de aceptación

- Login, selector de contexto y Dash shell usan los mismos tokens/primitivas sin duplicar semántica.
- El mismo componente funciona con teclado, mouse y touch.
- La documentación visual elegida se genera localmente/CI sin SaaS pago, si ADR-004 la adopta.
- No existen reglas de negocio ni SDKs de proveedor en `packages/ui`.
- Los resultados de automatización y revisión manual quedan adjuntos al cambio.
- Ningún componente fuera del inventario I0 se crea sin consumidor aprobado.
