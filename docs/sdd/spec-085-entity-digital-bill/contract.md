# Contrato — SPEC-085 DigitalBill

DigitalBill es presentación pública limitada de Check mediante token opaco y expiración.
Incluye snapshot de líneas/totales permitido, status y locale; no reemplaza Invoice fiscal.
Token es revocable, no secuencial y no aparece en logs. Acceso no revela guest/payment
details ni habilita mutaciones salvo contratos separados. Actualizaciones usan revisión y
cache-control restrictivo. Tests cubren token, expiry, settled/void, redacción y enumeración.
