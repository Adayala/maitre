# Contrato de entidad — SPEC-161 Reputation Score

ReputationScore es una proyección temporal por sucursal y período que conserva valor decimal,
escala, volumen, fuentes, cobertura y versión de fórmula. No mezcla escalas sin normalización
explícita y comunica incertidumbre cuando la muestra es insuficiente. Tests cubren fuentes
faltantes, outliers, ventanas, edición retroactiva, redondeo, determinismo, freshness y
aislamiento entre tenants.
