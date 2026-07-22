# Especificación — SPEC-088 QR Menu API

`GET /public/menu/{token}` resuelve exclusivamente una capability `MENU_READ` y devuelve la
MenuRevision publicada, locale, precios, disponibilidad y declaraciones de alérgenos. Token
inválido, revocado o vencido produce la misma respuesta anti-enumeración.

El token se almacena como hash, aplica rate limit y no expone IDs internos. ETag identifica menu
revision + locale; rotación/revocación invalida cache. Esta API no crea orders, muestra bills ni
acepta pagos.
