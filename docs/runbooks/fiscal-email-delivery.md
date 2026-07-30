# Entrega de comprobantes fiscales por email

El runtime usa Resend mediante HTTPS, sin SDK ni credenciales persistidas en la base de datos.

## Configuración

```dotenv
RESEND_API_KEY=<secret-with-sending-access>
FISCAL_EMAIL_FROM=Maitre <facturas@dominio-verificado.example>
CRON_SECRET=<random-secret-at-least-32-bytes>
```

La clave debe tener sólo permiso de envío y permanecer en el secret manager del entorno. El
remitente debe pertenecer a un dominio verificado por el proveedor.

## Operación

1. Crear la solicitud con `POST /v1/invoices/:id/deliveries` y `Idempotency-Key`.
2. Procesar su ID con `POST /v1/invoice-deliveries/:id/process`.
3. Verificar estado `SENT` o `FAILED`. Un `SENT` repetido no vuelve a enviar; un `FAILED` puede
   reintentarse.

En la configuración portable incluida, Vercel invoca diariamente a las 03:00 UTC
`GET /internal/fiscal/invoice-deliveries/process`. El endpoint exige
`Authorization: Bearer <CRON_SECRET>`, procesa como máximo diez entregas por ejecución y recupera
claims `PROCESSING` abandonados después de cinco minutos.

Vercel Hobby sólo admite cron diario. En Pro puede cambiarse el schedule a `*/5 * * * *`; también
puede usarse un scheduler externo con el mismo header para lograr menor latencia.

El sistema usa también el ID de entrega como idempotencia ante el proveedor. No registrar API
keys, destinatarios, cuerpos ni adjuntos en logs. Rotar la clave si se sospecha exposición.
