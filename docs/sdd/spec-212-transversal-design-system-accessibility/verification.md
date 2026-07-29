# Verificación — SPEC-212

## Criterios

### CAD-212-01 — Existe un lenguaje visual único basado en tokens, primitivas y patrones reutilizables

- [ ] login, selector de contexto y Dash shell usan los mismos tokens/primitivas sin duplicar semántica;
- [ ] no existen reglas de negocio ni SDKs de proveedor en `packages/ui`;
- [ ] ningún componente fuera del inventario I0 se crea sin consumidor aprobado.

### CAD-212-02 — La accesibilidad WCAG 2.2 AA es piso verificable desde el primer componente

- [ ] ESLint sin errores, incluyendo JSX a11y;
- [ ] TypeScript estricto sin errores;
- [ ] axe-core sin violaciones en componentes y páginas cubiertas;
- [ ] se completa sólo con teclado y el foco siempre es visible;
- [ ] se completa con lector de pantalla y nombres/estados son comprensibles;
- [ ] funciona con zoom 200 % y reflow de 320 CSS px;
- [ ] mantiene contraste mínimo y no depende sólo de color;
- [ ] targets operativos alcanzan 44×44 CSS px.

### CAD-212-03 — La UI soporta operación realista bajo presión, movilidad y conectividad imperfecta

- [ ] el mismo componente funciona con teclado, mouse y touch;
- [ ] respeta reducción de movimiento;
- [ ] errores permiten identificar, corregir y conservar la entrada;
- [ ] offline, sincronización y recuperación son explícitos;
- [ ] se prueba en el dispositivo/contexto primario de la app.

### CAD-212-04 — Las dependencias UI y tooling se adoptan sólo con evidencia de accesibilidad, bundle y mantenimiento

- [ ] baseline y delta de bundle por candidato UI registrados antes de ADR-004;
- [ ] la adopción de candidatos UI conserva evidencia de accesibilidad y costo;
- [ ] ninguna dependencia se aprueba sólo por conveniencia teórica.

### CAD-212-05 — La documentación visual y las pruebas UX son ejecutables localmente y en CI sin SaaS pago obligatorio

- [ ] tests unitarios y de interacción aprobados;
- [ ] Playwright aprueba navegación por teclado y flujos críticos;
- [ ] screenshots representativos no cambian sin aprobación explícita;
- [ ] la documentación visual elegida se genera localmente/CI sin SaaS pago, si ADR-004 la adopta.

### CAD-212-06 — La revisión manual sigue siendo obligatoria y sus resultados quedan enlazados

- [ ] los resultados de automatización y revisión manual quedan adjuntos al cambio;
- [ ] la revisión manual se ejecuta en flujos críticos aprobados;
- [ ] la aceptación no depende sólo de automatización.

### CAD-212-07 — Cada app expresa su rol sin perder el lenguaje compartido

- [ ] Customer, Waiter, Host, Kitchen, Cashier y Dash son distinguibles por jerarquía y firma visual;
- [ ] foco, estados críticos y acciones mantienen significado consistente entre superficies;
- [ ] toda animación nueva respeta `prefers-reduced-motion`;
- [ ] temas claros y oscuros mantienen contraste AA y targets de al menos 44×44 CSS px.
