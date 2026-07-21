# Contrato — SPEC-084 QRMenu

QRMenu publica una referencia opaca a Menu revision y Branch, no datos sensibles ni IDs
predecibles. Campos: public token aleatorio/rotatable, scope, status, validity window,
menuRevisionId y auditoría. Resolver token devuelve sólo catálogo publicado autorizado;
revocado/vencido no filtra Branch. QR no concede capacidad de ordenar/pagar. Tests cubren
entropía, rotación, cache, expiración, enumeración y revisión archivada.
