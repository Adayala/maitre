# Objetivo — SPEC-212

Definir un único lenguaje visual y de interacción que permita construir las aplicaciones de Maitre sin duplicar decisiones, sin sacrificar accesibilidad y sin acoplar el producto a un proveedor de hosting o a una biblioteca de componentes.

## Resultados esperados

- Interacciones claras bajo presión, ruido, movimiento, poca luz o conectividad inestable.
- Componentes reutilizables y testeables entre Guest, Floor, Kitchen, Cash, Dash y Connect.
- Accesibilidad WCAG 2.2 AA verificable desde el primer componente.
- Identidad visual consistente sin impedir patrones específicos por contexto operativo.
- Bundle, documentación y pruebas ejecutables con herramientas open source y free tier.

## Fuera de alcance

- Definir la marca final, ilustraciones o campañas.
- Diseñar cada pantalla funcional.
- Reemplazar las specs de dominio, permisos o flujos de cada aplicación.
- Garantizar conformidad mediante automatización solamente; la revisión manual sigue siendo obligatoria.
- Implementar patrones de Guest, Floor, Kitchen, Cash o Connect durante I0.
- Aprobar una dependencia UI sin medir accesibilidad, bundle, mantenimiento y costo CI.

## Criterios de aceptación

### CAD-212-01 — Existe un lenguaje visual único basado en tokens, primitivas y patrones reutilizables

La UI comparte tokens, primitivas y patrones con semántica consistente entre aplicaciones. Las decisiones visuales no se reescriben por pantalla sin necesidad aprobada.

### CAD-212-02 — La accesibilidad WCAG 2.2 AA es piso verificable desde el primer componente

Los componentes y flujos críticos deben ser navegables por teclado, comprensibles con lector de pantalla, visibles con foco adecuado y compatibles con contraste, zoom y touch targets requeridos.

### CAD-212-03 — La UI soporta operación realista bajo presión, movilidad y conectividad imperfecta

Las interacciones se diseñan para ambientes ruidosos, móviles o con conectividad degradada. El sistema visual no asume condiciones ideales de escritorio o atención exclusiva.

### CAD-212-04 — Las dependencias UI y tooling se adoptan sólo con evidencia de accesibilidad, bundle y mantenimiento

Bibliotecas candidatas como Tailwind, Radix, Lucide o Storybook sólo pueden adoptarse si demuestran valor y no contradicen presupuesto, accesibilidad o mantenibilidad.

### CAD-212-05 — La documentación visual y las pruebas UX son ejecutables localmente y en CI sin SaaS pago obligatorio

Los artefactos de documentación, accesibilidad, regresión visual y pruebas críticas deben poder generarse sin depender de un servicio pago no aprobado para el MVP.

### CAD-212-06 — La revisión manual sigue siendo obligatoria y sus resultados quedan enlazados

La automatización no reemplaza verificación manual. Los cambios relevantes conservan evidencia de tests automáticos y checklist manual en contexto operativo realista.
