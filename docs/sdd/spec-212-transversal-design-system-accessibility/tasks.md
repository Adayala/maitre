# Tareas — SPEC-212

- [ ] Aprobar SPEC-212 y ADR-004 con evidencia SPK-05.
- [x] Definir inventario documental mínimo de I0.
- [ ] Crear `packages/design-tokens` y `packages/ui`.
- [ ] Definir tokens semánticos y contrato de temas.
- [ ] Medir candidatos Tailwind/Radix/Lucide/Storybook antes de adoptarlos.
- [ ] Configurar sólo candidatos aceptados por ADR-004.
- [ ] Configurar `eslint-plugin-jsx-a11y`.
- [ ] Integrar axe-core con Testing Library y Playwright.
- [ ] Implementar foco global visible y skip link.
- [ ] Implementar primitivas de formulario requeridas por login/contexto.
- [ ] Implementar feedback I0: loading, empty, offline, session-expired y error.
- [ ] Implementar estado de conectividad y sincronización.
- [ ] Implementar navegación responsive del Dash shell.
- [ ] Añadir pruebas de teclado y screenshots críticos.
- [ ] Ejecutar revisión manual con teclado, lector de pantalla, zoom y touch.
- [ ] Validar login, selector y Dash en teléfono/tablet/desktop objetivo I0.
- [ ] Documentar excepciones y deuda de accesibilidad con owner y vencimiento.

## Incremento visual por rol — 2026-07-28

- [x] Definir una dirección visual diferenciada para Customer, Waiter, Host, Kitchen, Cashier y Dash.
- [x] Implementar capas finales `modern.css` en las cinco apps internas.
- [x] Separar la home pública Customer del acceso y los paneles de cuenta.
- [x] Incorporar foco visible y reducción de movimiento en las nuevas capas.
- [x] Compilar las seis apps y validar manualmente viewports representativos.
- [x] Desplegar y verificar las URLs productivas en Vercel.
- [ ] Automatizar screenshots y pruebas axe/teclado por superficie.
- [ ] Consolidar tokens estables en `packages/design-tokens`.
- [ ] Reducir duplicación histórica de `global.css` sin alterar flujos operativos.
