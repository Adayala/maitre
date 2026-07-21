# IA y gemelo digital

## Principio

La IA no se incorporará como un chatbot aislado. Debe reproducir el rol coordinador del maître: distribuir atención, supervisar comandas, anticipar problemas y proteger la experiencia.

## Visión comercial

> Los sistemas actuales muestran qué está pasando. Maitre muestra qué puede pasar y permite cambiarlo.

El término técnico es gemelo digital; la propuesta comercial es una máquina del tiempo operacional.

## Tres vistas

### Maitre Rewind

Reconstruye qué ocurrió, identifica causas y explica incidentes.

### Maitre Live

Muestra carga real, mesas en riesgo, comandas, atención y capacidad actual.

### Maitre Ahead

Predice 15, 30 y 60 minutos, simula decisiones y muestra futuros alternativos.

### Maitre Autopilot

Ejecuta acciones reversibles autorizadas y solicita aprobación para decisiones sensibles.

## Capacidad real de servicio

```text
Capacidad física
+ personal disponible
+ capacidad de cocina
+ duración probable
- reservas comprometidas
- restricciones operativas
= capacidad segura disponible
```

Maitre debe responder no solo si hay una mesa libre, sino si todo el restaurante puede atenderla correctamente.

## Caso demostrativo

Pregunta:

> ¿Puedo aceptar una reserva de diez personas a las 21:30?

Respuesta esperada:

```text
Sí, pero no en el salón principal.

Recomendación:
- terraza
- mesas T4 y T5
- plaza de Ana
- menú grupal B
- aviso a cocina 20 minutos antes

Ingreso estimado: $680.000
Demora adicional al resto: 4 minutos
Probabilidad de cumplir el servicio: 89%
```

## Datos necesarios

- Reservas y no-shows.
- Apertura y cierre de visitas.
- Ocupaciones de mesa.
- Pedidos y productos.
- Creación, preparación y entrega de comandas.
- Solicitudes de cuenta.
- Cierres y pagos.
- Empleados y plazas.
- Feedback e incidentes.

## Etapas de autonomía

| Nivel | Comportamiento |
| --- | --- |
| Observador | Describe el estado |
| Copilot | Recomienda acciones |
| Supervisado | Prepara acciones y pide confirmación |
| Autopilot | Ejecuta acciones previamente autorizadas |

## Acciones automatizables

- Ajustar disponibilidad de reservas.
- Reordenar recomendaciones del menú.
- Pausar temporalmente recomendaciones de una estación saturada.
- Reasignar tareas de salón.
- Alertar demoras.
- Secuenciar comandas.

## Acciones protegidas

- Cambios de precios.
- Descuentos y compensaciones.
- Cambios laborales.
- Decisiones de alérgenos o seguridad alimentaria.
- Anulaciones fiscales.
- Publicación de respuestas reputacionales sin política aprobada.

## Requisitos de confianza

- Mostrar fuente de datos y frescura.
- Indicar confianza y supuestos.
- Explicar por qué se recomienda una acción.
- Registrar decisión, actor y resultado.
- Permitir deshacer acciones reversibles.
- Evitar aprendizaje cruzado entre tenants con datos identificables.

## Estrategia de implementación

La primera versión utiliza reglas y estadísticas explicables. Los modelos predictivos se incorporan cuando exista volumen suficiente. La IA generativa explica y asiste, pero no sustituye cálculos fiscales ni reglas críticas.
