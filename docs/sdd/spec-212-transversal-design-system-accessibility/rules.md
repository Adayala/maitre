# Reglas — SPEC-212

## Invariantes

1. Toda interfaz implementada cumple WCAG 2.2 AA en sus flujos soportados.
2. Ninguna acción esencial depende sólo de color, hover, gesto de arrastre o precisión motriz.
3. Ninguna primitiva de UI contiene lógica de negocio, acceso a datos o permisos.
4. Tokens semánticos son la única fuente de valores visuales compartidos.
5. Un target operativo mide al menos 44×44 CSS px, salvo excepción documentada y accesible.
6. Foco, nombres accesibles, labels y mensajes de error se consideran parte de la API del componente.
7. Estado offline o de sincronización nunca se oculta cuando puede cambiar la confianza en el dato.
8. Acciones monetarias, fiscales, de alérgenos o irreversibles no usan confirmación optimista.
9. Todas las apps funcionan con teclado aunque su entrada primaria sea táctil.
10. Una dependencia visual externa debe ser reemplazable detrás de componentes propios.
11. I0 no crea componentes para apps o patrones fuera de SPEC-213.
12. Tailwind, Radix, Lucide y Storybook no son baseline hasta aceptar ADR-004.
13. Íconos nunca son la única representación de una acción crítica.
14. Un componente se promociona a `packages/ui` por semántica compartida, no por anticipación.
15. La automatización de accesibilidad nunca sustituye revisión manual del flujo.

## Regla DRY

La duplicación de markup no justifica por sí sola una abstracción. Se comparte una pieza cuando posee semántica, comportamiento, accesibilidad o evolución común. Las variantes específicas del dominio permanecen cerca de su feature.

## Excepciones

Toda excepción incluye:

- criterio WCAG o regla afectada;
- razón técnica o legal;
- alternativa accesible;
- apps y flujos alcanzados;
- responsable y fecha de revisión;
- prueba que impida ampliar accidentalmente la excepción.
