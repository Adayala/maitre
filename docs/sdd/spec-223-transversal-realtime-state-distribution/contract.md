# Contrato transversal — SPEC-223 Realtime State Distribution

Realtime distribuye proyecciones, no autoridad: toda mutación pasa por comandos HTTP y el
cliente reconcilia snapshot, cursor y eventos. El adapter puede usar Supabase Realtime u otro
proveedor sin filtrar al dominio. Autorización se revalida por tenant/sucursal. Tests cubren
reconexión, gaps, duplicados, orden, backpressure, revocación, fallback a polling y límites.
