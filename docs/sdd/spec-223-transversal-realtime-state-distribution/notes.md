# Decisiones y fuentes — SPEC-223

## Decisiones

- Polling condicional es el baseline más simple y portable para bajo volumen; la medición decide si es suficiente.
- Push notifica invalidación, no transporta el modelo autoritativo completo.
- Supabase Broadcast es candidato porque la plataforma de datos ya fue elegida, pero queda encapsulado y no es requisito del dominio.
- Private channels/RLS son obligatorios si se usa Supabase Realtime.
- Postgres Changes directo acopla UI a tablas/policies y queda fuera del contrato público.
- Un refresh de seguridad periódico evita depender para siempre de una conexión aparentemente viva.

## Fuente primaria

- [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Supabase Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)

## Triggers para push/worker dedicado

- p95 mayor al objetivo con polling optimizado;
- requests/egress próximos a cuota;
- más dispositivos activos que el escenario previsto;
- necesidad de latencia sub-segundo validada;
- actualizaciones frecuentes que vuelven ineficiente el refetch;
- workers continuos ya justificados por SPEC-217.
