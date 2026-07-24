# Especificación — SPEC-170 External Review Platforms

Puerto por provider con capabilities declaradas: polling/webhook, pagination/cursor, edit/delete,
attribution, allowed storage, rate limits, retention y freshness. Credentials viven en secret
adapter; raw provider payload no atraviesa el dominio.

Cada adapter requiere spike fechado con fuentes oficiales, scopes, cuotas/costo, ToS, data rights,
webhook authenticity, delete behavior y exit strategy. Resultado PASS/FAIL/INCONCLUSIVE; sin PASS
no se promete ni habilita el conector. Backoff/DLQ no bloquea feedback propio.

El contrato del provider debe hacer explícitas tanto las capacidades soportadas como las no soportadas.
Una plataforma que sólo permita lectura no debe “simular” ack, delete o respuesta remota. El spike
fechado funciona como gate de producto y de compliance antes de cualquier roadmap de implementación.

La degradación de un conector externo nunca debe comprometer la recepción de feedback first-party ni
la operación interna del dominio. Los incidentes del provider se aíslan con colas, backoff, DLQ y
observabilidad específica.
