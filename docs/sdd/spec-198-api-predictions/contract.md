# Contrato API — SPEC-198 Predictions

Solicitar predicción idempotente y consultar resultado, incertidumbre, explicación, modelo y
freshness. Procesamiento asíncrono admite timeout y fallback explícito; no fabrica resultados
cuando faltan datos. Tests cubren modelo inactivo, features faltantes, reintento, drift,
presupuesto, privacidad, RBAC y aislamiento.
