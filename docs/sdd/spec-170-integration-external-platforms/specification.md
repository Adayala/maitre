# Especificación — SPEC-170 External Review Platforms

Puerto por provider con capabilities declaradas: polling/webhook, pagination/cursor, edit/delete,
attribution, allowed storage, rate limits, retention y freshness. Credentials viven en secret
adapter; raw provider payload no atraviesa el dominio.

Cada adapter requiere spike fechado con fuentes oficiales, scopes, cuotas/costo, ToS, data rights,
webhook authenticity, delete behavior y exit strategy. Resultado PASS/FAIL/INCONCLUSIVE; sin PASS
no se promete ni habilita el conector. Backoff/DLQ no bloquea feedback propio.
