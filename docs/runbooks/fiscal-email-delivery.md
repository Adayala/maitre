# Entrega de comprobantes fiscales por email

El runtime usa Resend mediante HTTPS, sin SDK ni credenciales persistidas en la base de datos.

## Configuración

```dotenv
RESEND_API_KEY=<secret-with-sending-access>
FISCAL_EMAIL_FROM=Maitre <facturas@dominio-verificado.example>
```

La clave debe tener sólo permiso de envío y permanecer en el secret manager del entorno. El
remitente debe pertenecer a un dominio verificado por el proveedor.

## Operación

1. Crear la solicitud con `POST /v1/invoices/:id/deliveries` y `Idempotency-Key`.
2. Procesar su ID con `POST /v1/invoice-deliveries/:id/process`.
3. Verificar estado `SENT` o `FAILED`. Un `SENT` repetido no vuelve a enviar; un `FAILED` puede
   reintentarse.

El sistema usa también el ID de entrega como idempotencia ante el proveedor. No registrar API
keys, destinatarios, cuerpos ni adjuntos en logs. Rotar la clave si se sospecha exposición.
