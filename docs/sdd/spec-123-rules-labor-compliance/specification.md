# Especificación — SPEC-123 Labor Compliance Rules

LaborPolicyVersion contiene jurisdicción, fuente oficial/documento, fecha de consulta, vigencia,
hash, reviewer competente, aprobación, supersession, fixtures y disclaimer. Reglas tenant sólo
pueden ser más restrictivas cuando la policy lo permita y conservan provenance.

El evaluador genera findings `INFO | WARNING | BLOCKING` explicables, con rule version, evidence y
occurrence date. No sanciona, despide, modifica TimeEntry ni decide automáticamente una cuestión
laboral. Sin jurisdicción/policy aprobada retorna `NOT_CONFIGURED` y bloquea toda afirmación de
cumplimiento, manteniendo captura y evidencia.
