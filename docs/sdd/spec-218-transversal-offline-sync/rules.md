# Reglas — SPEC-218

## Invariantes

1. Offline se habilita por comando y app; lo no declarado es online-only.
2. Una intención se persiste antes de reflejar éxito optimista.
3. Cada comando posee `clientMutationId` estable y deduplicación server-side.
4. ACK de red no equivale a aceptación del dominio.
5. El reloj del dispositivo no define orden autoritativo.
6. Conflictos se resuelven mediante reglas de dominio, no last-write-wins global.
7. Pago, caja, factura/ARCA, permisos y configuración sensible son online-only en el MVP.
8. Guest no ve un pedido como confirmado antes del ACK del servidor.
9. Tokens privilegiados, passwords y secretos nunca se almacenan offline.
10. Un cambio de app/schema preserva comandos pendientes o bloquea de forma recuperable.
11. Logout/cambio de contexto no elimina silenciosamente trabajo pendiente.
12. La UI siempre comunica estado y confianza del dato.

## Prohibiciones

- Usar `localStorage` como cola durable.
- Reintentar creando una nueva idempotency key.
- Ocultar un conflicto mediante overwrite automático no aprobado.
- Cachear una mutación HTTP como éxito.
- Prometer operación offline ilimitada o seguridad criptográfica inexistente en un browser comprometido.
