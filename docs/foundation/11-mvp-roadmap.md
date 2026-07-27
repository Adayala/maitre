# MVP y roadmap

> Este documento describe la evolución del producto. El alcance implementable inmediato, la distinción entre MVP Demo y MVP Pilot y los gates por incremento se definen en [`SPEC-222`](../sdd/spec-222-transversal-mvp-scope-delivery-plan/).

## Objetivo del MVP

Demostrar que un tenant puede contratar servicios, configurar una sucursal y completar una visita de salón desde la reserva o llegada hasta la cuenta, sin cerrar todavía todas las integraciones fiscales y predictivas.

## Fase 0 — Validación

- Entrevistas con dueños, maîtres, mozos, cocina y caja.
- Validación del glosario.
- Observación de servicios reales.
- Comparación con POS existentes.
- Prototipo de dashboard y plano de salón.
- Prueba de disposición a pagar por módulos.

## Fase 1 — Plataforma fundacional

**App:** Maitre Dash (no táctil primero)

- Tenant, marca, entidad fiscal y sucursal.
- Usuarios, roles y auditoría.
- Catálogo, suscripción y entitlements.
- Dashboard de autogestión: crear sucursal, configurar salón, mesas, menú.
- Invitar usuarios, asignar roles y sucursales.

## Fase 2 — Operación mínima

**Apps:** Maitre Floor (táctil), Maitre Kitchen (táctil)

- Abrir jornada de servicio, plazas y asignaciones.
- Registrar llegada, visita y ocupación de mesas.
- Mozo toma pedido (Floor, touch-first): QR Menu integrado.
- Pedido se envía como comanda a Kitchen.
- Cocina recibe, cambia estado (listo, entregado).
- Precuenta y cuenta básica desde Floor.
- Sincronización en tiempo real entre apps.

## Fase 3 — Adquisición y autoservicio

**App:** Maitre Guest (táctil, mobile-first)

- Discovery público sin login para menú, promociones y sucursales.
- Reservas remotas desde Guest (mobile-first).
- Confirmación y recordatorio.
- QR Ordering híbrido: comensal pide desde celular, mozo revisa (Floor).
- Solicitud de asistencia desde Guest.
- Solicitud de cuenta digital desde Guest.
- Feedback post-visita desde Guest.
- Sincronización automática con visita abierta en Floor.

## Fase 4 — Dinero y fiscalidad

**App:** Maitre Cash (táctil primero, no táctil opcional)

- Caja y sesiones desde Cash.
- Pagos parciales y división de cuenta.
- Pago digital desde Guest (sincronizado con Cash).
- Billing y comprobantes.
- ARCA y puntos de venta.
- Libro IVA y conciliación en Dash.
- Cierre de caja con arqueo.

## Fase 5 — Integración y reputación

**App:** Maitre Connect (no táctil), Maitre Dash (extensión)

- Maitre Connect: gestión de conectores, webhooks, OAuth.
- Google Business Profile: sincronización de reseñas.
- Casos y respuestas de reputación en Dash.
- Importación/migración de POS.
- Conectores adicionales según viabilidad.
- Event hub maduro para integraciones terceras.

## Fase 6 — Inteligencia

- Rewind operacional.
- Predicción de liberación de mesas.
- Demora por centro de preparación.
- Riesgo por visita.
- Capacidad real de servicio.
- Maitre Ahead.
- Autopilot supervisado.

## Walking skeleton (eventos por app)

```
Dash: Tenant se registra → compra Floor + Reservations + QR
Dash: Crear sucursal → configurar salón y menú
Dash: Invitar mozo y cocina

Floor (mozo): Abrir jornada → asignar plaza
Floor (mozo): Escanear QR mesa → crear visita
Floor (mozo): Registrar llegada
Floor (mozo): Tomar pedido (QR Menu integrado)

Kitchen (tablet): Recibe comanda → marca como listo

Floor (mozo): Solicitar cuenta
Cash: Registrar pago
Dash: Cerrar visita

Guest (celular): Recibe solicitud de feedback → responde
Dash: Ver feedback en reporte de visita
```

## Criterios de salida del MVP

- Aislamiento multi-tenant probado.
- Activación por sucursal mediante entitlements.
- Recorrido principal sin edición manual de datos.
- Auditoría de acciones sensibles.
- Pedidos y comandas idempotentes.
- Operación usable por personal no técnico.
- Métricas de uso y errores.
- Al menos un piloto real.

## Fuera de alcance inicial

- Optimización autónoma completa.
- Reconocimiento facial.
- Marketplace de insumos.
- Nómina y liquidación salarial completa.
- Contabilidad general.
- Operación internacional multi-país.
- Scraping de plataformas externas.
