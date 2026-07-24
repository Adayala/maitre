# Especificación — SPEC-092 Menu Recommendations API

Recomienda sólo items disponibles de una MenuRevision usando categoría, presupuesto y
restricciones explícitas de la solicitud. Devuelve score/rank, reason codes y policy/model version;
si falla el ranking usa un orden determinista por catálogo.

Restricciones sensibles se procesan efímeramente por default, no se registran en logs ni crean
perfil cross-visit. Persistirlas requiere purpose y consentimiento separados. El resultado no
infiere diagnósticos ni garantiza ausencia de contaminación cruzada.

La entrada admite sólo señales explícitas permitidas: category/preference filters, presupuesto,
idioma, restricciones tipadas y contexto de menú publicado. No usa historial oculto del usuario ni
señales inferidas fuera del purpose aprobado. Si una señal no es soportada, la respuesta lo declara
sin degradar a una recomendación engañosa.

La salida lista productos o combinaciones permitidas con score ordenado, rank estable, reason codes
humanamente comprensibles, `menuRevisionId`, `policyVersion` y `modelVersion?` cuando aplique. Si
el ranking inteligente no puede ejecutarse, el fallback ordena determinísticamente por reglas de
catálogo aprobadas, declarando el modo degradado.
