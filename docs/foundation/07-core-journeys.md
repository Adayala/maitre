# Recorridos principales

La trazabilidad entre estos recorridos, las aplicaciones y la evidencia Playwright vigente se
mantiene en [20-e2e-flow-coverage.md](20-e2e-flow-coverage.md). Un happy path documentado aquí no se
considera cubierto hasta que esa matriz identifique un journey real y sus pendientes.

## 1. Del registro a la primera operación

```text
Registrar tenant
→ crear administrador
→ elegir servicios
→ aceptar cotización
→ activar suscripción
→ crear marca y entidad fiscal
→ crear sucursal
→ configurar salón y mesas
→ configurar menú
→ invitar empleados
→ abrir primera jornada
```

### Resultado

El tenant queda listo para operar y el dashboard muestra cualquier configuración pendiente.

## 2. Expansión del tenant

```text
Comprar capacidad de sucursal
→ crear sucursal
→ heredar configuración de marca
→ seleccionar servicios locales
→ asociar entidad fiscal
→ configurar excepciones
→ activar
```

Comprar capacidad y crear la sucursal son acciones relacionadas, pero diferentes.

## 3. Reserva remota

```text
Explorar propuesta pública
→ seleccionar sucursal
→ iniciar sesión cuando decide reservar
→ fecha, hora y cantidad
→ calcular capacidad
→ retener disponibilidad
→ solicitar datos y seña opcional
→ confirmar
→ enviar recordatorio
→ llegada
→ convertir en visita
```

La reserva normalmente compromete capacidad, no una mesa exacta. La mesa puede asignarse al confirmar, antes del servicio o al llegar.

## 4. Atención espontánea

```text
Registrar grupo
→ verificar disponibilidad
→ abrir visita
→ asignar mesa o combinación
→ asignar responsable
→ iniciar servicio
```

## 5. Pedido híbrido

```text
Mozo abre visita
→ comensal escanea QR
→ consulta menú
→ crea pedido
→ mozo aprueba, si corresponde
→ dividir en comandas
→ preparar
→ despachar
→ entregar
```

Cada ítem conserva origen y autorizador:

```text
origin = CUSTOMER_QR
approvedBy = Employee-48
```

## 6. Cuenta y pago

```text
Solicitar cuenta
→ generar precuenta
→ dividir opcionalmente
→ registrar uno o varios pagos
→ emitir comprobante/s
→ cerrar cuenta
→ cerrar visita
→ liberar mesa
→ limpieza
```

El cliente puede pedir cuenta impresa, verla en el teléfono o iniciar pago digital, según servicios activos.

## 7. Feedback posterior

```text
Cerrar visita
→ enviar encuesta
→ registrar feedback
→ analizar categorías
→ crear caso si es necesario
→ responder o intervenir
```

## 8. Reseña externa

```text
Sincronizar con proveedor
→ normalizar reseña
→ asignar sucursal
→ analizar
→ crear borrador de respuesta
→ aprobar
→ publicar si la API lo permite
→ cerrar caso
```

## 9. Baja de un servicio

```text
Solicitar baja
→ validar dependencias
→ mostrar impacto
→ programar fin de ciclo
→ retirar entitlement
→ dejar datos en solo lectura
→ conservar/exportar historial
```

## 10. Reducción de sucursales

Si el tenant reduce su capacidad de tres a dos sucursales:

1. Debe seleccionar cuál se desactiva.
2. La sucursal deja de aceptar operaciones nuevas.
3. Sus datos continúan disponibles según política.
4. Puede reactivarse posteriormente.
5. Los documentos fiscales no se eliminan.

## Estado de cobertura transversal

Al 2 de agosto de 2026, el núcleo mesa → pedido → cocina → pago → cierre, la configuración
operativa compartida y la reserva Guest → Host → Floor tienen evidencia real. Siguen pendientes,
entre otros, los siguientes recorridos críticos:

- dos rondas completas que incluyan bebida y postre;
- emisión y entrega de factura/comprobante después del pago;
- llegada con reserva y conversión en visita;
- walk-in gestionado por Host/Maître;
- login y RBAC exhaustivo de cada rol recién configurado;
- expansión/reducción de sucursales, baja de servicios, feedback y Reputation.

El backlog priorizado y los criterios de aceptación están definidos en
[Cobertura E2E de flujos entre aplicaciones](20-e2e-flow-coverage.md#backlog-de-cobertura-posterior).
