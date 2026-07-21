# Decisiones y fuentes — SPEC-212

## Decisiones

- WCAG 2.2 AA es el piso de conformidad.
- Se adopta 44×44 CSS px como objetivo operativo, aunque WCAG 2.2 AA permite un mínimo de 24×24 con excepciones; reduce errores bajo presión y se aproxima al criterio mejorado.
- CSS custom properties evitan que Tailwind CSS sea la fuente de verdad y permiten migrar herramientas.
- Radix UI se limita a comportamiento complejo y se encapsula para evitar lock-in.
- Storybook y screenshots de Playwright reemplazan servicios pagos durante el MVP.
- Dark mode no es un requisito general; los temas se justifican por contexto y validación.

## Fuentes normativas

- [Web Content Accessibility Guidelines (WCAG) 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG 2.2 — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/)

## Preguntas para validar con usuarios

- Densidad óptima de Floor y Kitchen a distancia real de uso.
- Contraste y tema apropiados para iluminación de cocina y salón.
- Uso efectivo con guantes, manos húmedas o dispositivo montado.
- Atajos de teclado más valiosos para Cash y Dash.
- Nivel de conectividad y feedback necesario para confiar en estados sincronizados.
