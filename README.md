# Maitre

<p align="center">
  <img src="docs/assets/branding/maitre-logo.png" alt="Logo de Maitre" width="720">
</p>

Maitre es una plataforma operativa modular para restaurantes argentinos. Está diseñada para acompañar desde un único local hasta grupos multi-marca y multi-sucursal, integrando la operación de salón, reservas, pedidos, cocina, cuentas, pagos, facturación y reputación.

> Los sistemas tradicionales administran mesas, pedidos y cajas. Maitre administra el servicio.

## Visión

Maitre propone un modelo gastronómico que representa la operación real del restaurante y permite activar capacidades por tenant o sucursal. La plataforma combina atención humana y experiencias digitales —como menú, pedidos y solicitud de cuenta mediante QR— sin imponer un modelo de autoservicio.

Sus principales objetivos son:

- Centralizar marcas, entidades fiscales, sucursales, salones, mesas y equipos.
- Unificar reservas, visitas, pedidos, comandas, cuentas, pagos y comprobantes.
- Ofrecer servicios modulares y configurables según las necesidades de cada sucursal.
- Integrar requisitos locales de Argentina, incluyendo ARCA, IVA y medios de pago.
- Relacionar feedback y reputación con los eventos reales de cada visita.
- Evolucionar hacia capacidades predictivas y un maître digital supervisado.

El proyecto sigue un enfoque **Spec-Driven Development (SDD)**: primero se definen contratos formales y verificables; después se implementa y valida el software contra esas especificaciones.

## Stack inicial

- **Frontend:** React.js.
- **Backend:** Node.js.
- **Plataforma:** Vercel para la primera etapa.

La arquitectura mantiene dominio, datos e integraciones desacoplados de Vercel para permitir que frontend, APIs, workers o persistencia migren de forma independiente cuando el crecimiento lo requiera. Los criterios completos están en [Stack técnico y estrategia de plataforma](docs/sdd/TECH_STACK.md).

## Documentación

### Producto y fundamentos

- [Índice de fundamentos](docs/foundation/README.md)
- [Visión y propuesta de valor](docs/foundation/00-vision.md)
- [Principios de producto](docs/foundation/01-product-principles.md)
- [Mercado y modelo de negocio](docs/foundation/02-market-and-business.md)
- [Catálogo de servicios](docs/foundation/03-service-catalog.md)
- [Tenancy y suscripciones](docs/foundation/04-tenancy-subscriptions.md)
- [Glosario del dominio](docs/foundation/05-domain-glossary.md)
- [Modelo de dominio](docs/foundation/06-domain-model.md)
- [Recorridos principales](docs/foundation/07-core-journeys.md)
- [Principios de arquitectura](docs/foundation/10-architecture-principles.md)
- [Roadmap del MVP](docs/foundation/11-mvp-roadmap.md)
- [Decisiones y preguntas abiertas](docs/foundation/13-decisions-and-open-questions.md)

### Especificaciones SDD

- [Cómo empezar](docs/sdd/START_HERE.md)
- [Guía rápida](docs/sdd/QUICK_START.md)
- [Índice maestro de especificaciones](docs/sdd/INDEX.md)
- [Estado general de las specs](docs/sdd/SPECS.md)
- [Estructura de una especificación](docs/sdd/_guides/SPEC_STRUCTURE.md)
- [Formato de especificaciones](docs/sdd/_guides/SPEC_FORMAT.md)
- [Roadmap de especificaciones del MVP](docs/sdd/_guides/00-mvp-specifications-roadmap.md)
- [Prioridades y tareas pendientes](docs/sdd/_guides/01-priority-specs-todo.md)
- [Aplicaciones y dispositivos](docs/sdd/_guides/15-applications-and-devices.md)
- [Contratos de API](docs/sdd/_guides/16-api-specifications.md)
- [Contratos de eventos](docs/sdd/_guides/17-event-specifications.md)
- [Calidad de ingeniería y gates SDD](docs/sdd/spec-207-transversal-engineering-quality/)
- [Arquitectura free tier para el MVP](docs/sdd/spec-208-transversal-zero-cost-mvp/)
- [Arquitectura del monorepo](docs/sdd/spec-209-transversal-monorepo-architecture/)
- [Plataforma de datos e identidad](docs/sdd/spec-210-transversal-data-identity-platform/)
- [Toolchain de implementación](docs/sdd/spec-211-transversal-implementation-toolchain/)
- [Sistema de diseño y accesibilidad](docs/sdd/spec-212-transversal-design-system-accessibility/)
- [Primer corte vertical del MVP](docs/sdd/spec-213-transversal-mvp-walking-skeleton/)
- [Ambientes, configuración y secretos](docs/sdd/spec-214-transversal-environments-configuration-secrets/)
- [Estándares de APIs HTTP](docs/sdd/spec-215-transversal-http-api-standards/)

## Roadmap resumido

1. Plataforma fundacional: tenants, sucursales, usuarios, catálogo y suscripciones.
2. Operación mínima: salón, jornadas, visitas, pedidos y cocina.
3. Adquisición y autoservicio: reservas, experiencia Guest y QR híbrido.
4. Dinero y fiscalidad: caja, pagos, comprobantes y ARCA.
5. Integraciones y reputación: conectores, reseñas y migraciones.
6. Inteligencia: predicción operacional y automatización supervisada.

## Estado del repositorio

Este repositorio contiene actualmente la definición funcional, estratégica y técnica de Maitre. Las especificaciones actúan como contrato para las futuras implementaciones de backend, frontend, integraciones y pruebas.
