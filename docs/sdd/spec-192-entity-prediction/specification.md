# Especificación — SPEC-192 Prediction

Inmutable: model version, feature snapshot/hash, generatedAt, horizon/expiry, result, uncertainty,
baseline, explanation y abstention reason. No es hecho observado.

Faltan features, coverage/confidence baja, model inactive, drift o budget agotado => ABSTAINED, no
resultado inventado. PII no se copia; refs se autorizan al leer. Expirada queda visible como
historia pero nunca alimenta decisión/automation actual.
