# Contrato API — SPEC-089 Order Modifications

Agregar, cancelar o cambiar cantidades y notas de ítems después del submit sólo mediante
comandos versionados. Cada modificación registra actor, motivo, delta monetario y estado
de envío a cocina; las transiciones irreversibles requieren una excepción autorizada y no
se reescribe el historial. Tests cubren concurrencia, reintentos, compensaciones, ítems ya
preparados, recálculo de impuestos, RBAC y trazabilidad completa.
