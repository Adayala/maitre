# ADR-004 — UI Foundations

| Campo | Valor |
| --- | --- |
| **ID** | ADR-004 |
| **Estado** | PROPOSED |
| **Fecha** | 2026-07-21 |
| **Deciders** | UNASSIGNED |
| **Blockers** | Asignar deciders y completar SPK-05 |
| **Specs relacionadas** | SPEC-207, SPEC-208, SPEC-209, SPEC-211, SPEC-212, SPEC-213, SPEC-224, SPEC-226 |

## Contexto

El walking skeleton necesita tokens, primitivas accesibles, documentación visual e iconografía sin sobredimensionar I0 ni acoplar el producto a una biblioteca.

## Fuerzas

- WCAG 2.2 AA y operación touch/teclado;
- bundle y CI dentro del presupuesto gratuito;
- estilos portables y reemplazables;
- componentes complejos sólo por necesidad observada;
- mantenimiento y licencias compatibles.

## Opciones consideradas

1. CSS custom properties + CSS mantenido por Maitre + HTML nativo.
2. CSS custom properties + Tailwind como consumidor.
3. Primitivas propias con Radix para comportamientos complejos puntuales.
4. Storybook estático o documentación mínima mediante rutas/harness propio.
5. Lucide detrás de un adapter de iconos o SVGs propios mínimos.

## Decisión propuesta

Aceptar CSS custom properties semánticas y HTML nativo como baseline. Evaluar Tailwind, Radix, Lucide y Storybook como dependencias independientes; adoptar sólo las que pasen accesibilidad, bundle, mantenimiento y costo CI en SPK-05.

## Consecuencias

### Positivas

- baseline pequeño y portable;
- evita crear componentes custom complejos sin necesidad;
- cada dependencia puede reemplazarse detrás de APIs propias.

### Negativas

- requiere medir y documentar varias decisiones pequeñas;
- CSS nativo inicial puede necesitar convenciones adicionales;
- Storybook ausente reduce catálogo visual hasta resolver el spike.

## Criterios de aceptación

- inventario I0 implementable sin dependencia candidata;
- contraste, teclado, axe y revisión manual aprobados;
- baseline/delta de bundle y duración CI registrados;
- licencia/mantenimiento revisados;
- dependencias encapsuladas y tree-shakeables;
- evidencia enlazada desde SPEC-226 SPK-05.

## Trigger de revisión

- segundo patrón complejo que HTML nativo no resuelva adecuadamente;
- crecimiento de inconsistencias CSS o tokens;
- impacto de bundle/build fuera del presupuesto;
- nueva app con necesidades visuales comprobadas.
