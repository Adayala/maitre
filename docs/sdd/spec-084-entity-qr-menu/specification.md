# Especificación — SPEC-084 QRMenu

QRMenu vincula Branch/table opcional con una MenuRevision publicada mediante capability opaca.
El token tiene al menos 128 bits de entropía, se almacena sólo como hash, posee purpose
`MENU_READ`, vigencia, revocación y rotación. La resolución aplica rate limit y respuesta uniforme
para token ausente, vencido o revocado.

El cache key incluye token fingerprint + menu revision + locale y nunca tenant/branch aportados por
el cliente. Rotación invalida caches. El capability sólo lee catálogo publicado: no permite crear
Order, consultar DigitalBill ni pagar; esas acciones requieren tokens distintos.
