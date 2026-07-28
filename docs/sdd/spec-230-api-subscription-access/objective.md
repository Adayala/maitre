# Objetivo — SPEC-230

## Propósito

Dar a todas las apps una única respuesta autoritativa para decidir qué módulos y cantidades mostrar,
sin replicar reglas de persistencia o catálogo en cada frontend.

## Criterios de aceptación

- [ ] Sólo devuelve ítems activos persistidos.
- [ ] Combina servicios tenant con servicios de la sucursal solicitada.
- [ ] Expone código, cantidad y alcance; nunca precio ni metadata comercial interna.
- [ ] Rechaza tenant o sucursal fuera del contexto autenticado.
