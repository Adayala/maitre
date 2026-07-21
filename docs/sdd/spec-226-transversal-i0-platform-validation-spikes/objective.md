# Objetivo — SPEC-226

Resolver con evidencia ejecutable las incertidumbres que bloquean ADR-002 y ADR-003, manteniendo el spike pequeño, descartable y separado del código productivo.

## Resultados esperados

- Compatibilidad local/Vercel demostrada.
- Conexión, pooling y migraciones Supabase verificadas.
- Auth/JWKS y mapping de identidad probados con acceso cross-tenant negativo.
- CI, bundle, latencia y consumo medidos.
- Backup/restore y salida probados a escala demo.
- ADR-002/003 aceptados, rechazados o revisados con evidencia enlazada.

## Fuera de alcance

- Implementar Tenant, Branch, User o Membership productivos.
- Crear UI final o design system completo.
- Usar datos, CUIT, emails o certificados reales.
- Convertir código experimental en base productiva sin review.
