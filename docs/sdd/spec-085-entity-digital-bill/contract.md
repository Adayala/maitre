# Contrato — SPEC-085 DigitalBill

DigitalBill es proyección pública versionada de Check mediante token opaco y expiración. Incluye
`checkRevision`, `asOf`, líneas/totales permitidos, saldo, status y locale; no reemplaza Invoice
fiscal. Token es hasheado at rest, revocable y no aparece en logs. Acceso no revela guest/payment
details ni habilita mutaciones. Actualizaciones usan revisión y cache-control restrictivo. Tests
cubren token, expiry, settled/void, redacción y enumeración.
