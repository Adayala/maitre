# Decisiones y preguntas abiertas

## Decisiones tomadas

| ID | Decisión | Estado |
| --- | --- | --- |
| D-001 | Maitre será multi-tenant y multi-sucursal | Aceptada |
| D-002 | Marca, entidad fiscal y sucursal son conceptos separados | Aceptada |
| D-003 | Los servicios pueden activarse por alcance | Aceptada |
| D-004 | Mesa y plaza son conceptos diferentes | Aceptada |
| D-005 | La visita, no la mesa, concentra la experiencia | Aceptada |
| D-006 | Pedido, comanda, cuenta, pago y comprobante son entidades diferentes | Aceptada |
| D-007 | Reservas y QR son servicios contratables | Aceptada |
| D-008 | Feedback y Reputation son servicios separados | Aceptada |
| D-009 | Desactivar servicios no elimina históricos | Aceptada |
| D-010 | Servicio comercial no implica microservicio | Aceptada |
| D-011 | La IA se construye sobre datos operativos y no como chatbot aislado | Aceptada |
| D-012 | Google Business Profile será el primer candidato de Reputation | Propuesta |

## Preguntas de producto

- ¿Cuál será el primer cliente piloto?
- ¿Maitre v1 reemplazará el POS o funcionará primero como complemento?
- ¿Qué módulos deben estar listos para cobrar la primera suscripción?
- ¿La contratación será mensual, anual o ambas?
- ¿Qué funciones estarán disponibles durante una prueba gratuita?
- ¿Qué operación offline exige el primer piloto?
- ¿El QR Ordering requiere siempre una visita abierta?
- ¿Reservations puede venderse sin Floor?

## Preguntas comerciales

- Precio base por tenant.
- Precio por sucursal.
- Servicios incluidos en cada paquete.
- Política de prorrateo.
- Costos de implementación.
- Soporte incluido.
- Límites de uso y cargos variables.

## Preguntas de dominio

- ¿Una sucursal puede operar con más de una entidad fiscal?
- ¿Cómo se representan concesiones o patios de comidas?
- ¿Una visita puede transferirse entre sucursales o solo una reserva?
- ¿Cómo se modelan eventos, banquetes y mesas no numeradas?
- ¿Cuándo se asigna mesa exacta a una reserva?
- ¿Qué políticas de combinación de mesas necesita el algoritmo?

## Preguntas fiscales

- Estrategia de homologación y certificados ARCA.
- Contingencia sin conectividad.
- Tipos de comprobantes iniciales.
- Tratamiento de propinas.
- Exportación y conciliación para IVA.
- Retención legal de comprobantes y auditoría.

## Preguntas técnicas

- Stack inicial.
- Base de datos y estrategia de aislamiento.
- Operación cloud versus edge local.
- Protocolo de sincronización offline.
- Proveedor de pagos.
- Bus de eventos inicial.
- Herramienta de observabilidad.
- Estrategia de importación desde POS.

## Preguntas de marca

- Mantener `Employees` o cambiar a `Experience` en el acrónimo.
- Identidad visual.
- Disponibilidad de dominio y marcas registradas.
- Uso de “Maitre”, “Maître” o ambos según contexto.

## Proceso de decisión

Cada decisión relevante debe registrar:

```text
ID
Fecha
Contexto
Alternativas
Decisión
Consecuencias
Responsable
Estado
```
