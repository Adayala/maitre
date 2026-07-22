# Especificación — SPEC-092 Menu Recommendations API

Recomienda sólo items disponibles de una MenuRevision usando categoría, presupuesto y
restricciones explícitas de la solicitud. Devuelve score/rank, reason codes y policy/model version;
si falla el ranking usa un orden determinista por catálogo.

Restricciones sensibles se procesan efímeramente por default, no se registran en logs ni crean
perfil cross-visit. Persistirlas requiere purpose y consentimiento separados. El resultado no
infiere diagnósticos ni garantiza ausencia de contaminación cruzada.
