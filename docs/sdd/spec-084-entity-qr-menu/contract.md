# Contrato — SPEC-084

`QRMenu` publica una referencia opaca a `Menu` revision y sucursal, no datos sensibles ni IDs
predecibles. Campos: public token aleatorio/rotatable, alcance, status, validity window,
`menuRevisionId` y auditoría. Resolver token devuelve sólo catálogo publicado autorizado;
revocado/vencido no filtra sucursal. QR no concede capacidad de ordenar/pagar. Tests cubren
entropía, rotación, cache, expiración, enumeración y revisión archivada.
