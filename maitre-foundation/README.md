# Maitre

**Management Assistant for Integrated Tables, Reservations & Employees**

Maitre es una plataforma SaaS multi-tenant y multi-sucursal para gestionar la operación de restaurantes argentinos mediante servicios contratables y configurables por sucursal.

El producto busca cubrir salón, reservas, pedidos, cocina, turnos, caja, facturación, ARCA, IVA, experiencia y reputación, sin obligar a cada cliente a contratar una solución monolítica.

## Estado

Este repositorio contiene la definición fundacional `v0.1`. Todavía no representa una especificación cerrada ni una arquitectura física definitiva.

## Documentos

1. [Visión y propuesta de valor](docs/00-vision.md)
2. [Principios de producto](docs/01-product-principles.md)
3. [Cliente, mercado y modelo de negocio](docs/02-market-and-business.md)
4. [Catálogo de servicios](docs/03-service-catalog.md)
5. [Tenancy, suscripciones y entitlements](docs/04-tenancy-subscriptions.md)
6. [Glosario del dominio](docs/05-domain-glossary.md)
7. [Modelo de dominio](docs/06-domain-model.md)
8. [Recorridos principales](docs/07-core-journeys.md)
9. [Feedback y reputación](docs/08-feedback-reputation.md)
10. [IA y gemelo digital](docs/09-ai-digital-twin.md)
11. [Principios de arquitectura](docs/10-architecture-principles.md)
12. [MVP y roadmap](docs/11-mvp-roadmap.md)
13. [Mensajes para el sitio](docs/12-site-messaging.md)
14. [Decisiones y preguntas abiertas](docs/13-decisions-and-open-questions.md)
15. [Fuentes y referencias](docs/14-references.md)

## Definición breve

> Maitre es el jefe de salón digital: una plataforma modular que coordina mesas, reservas, mozos, cocina, caja y experiencia del comensal, y que permite a cada restaurante contratar solamente los servicios que necesita.

## Alcance inicial

El cliente inicial es un restaurante argentino con atención en mesas, entre una y varias sucursales, uno o más salones, mozos organizados por plazas, cocina y barra, reservas, caja y facturación electrónica.

## Convenciones

- Los términos oficiales del producto se documentan en el glosario.
- Un servicio comercial no equivale necesariamente a un microservicio técnico.
- Las decisiones fiscales requieren validación profesional y seguimiento de normativa vigente.
- Las integraciones externas deben utilizar APIs oficiales o acuerdos de partner; no se basarán en scraping como capacidad contractual.
- Desactivar un servicio nunca elimina automáticamente su información histórica.

## Próximo hito

Validar la definición con entrevistas a dueños, maîtres, encargados, mozos, cocina y caja; convertir los recorridos principales en casos de uso y cerrar el alcance de la primera versión comercial.
