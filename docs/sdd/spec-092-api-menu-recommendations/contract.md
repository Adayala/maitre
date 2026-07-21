# Contrato API — SPEC-092 Menu Recommendations

Recomendar opciones disponibles desde el menú publicado usando señales explícitas como
categoría, restricciones y presupuesto. Cada resultado incluye motivo comprensible y
fallback determinista; no infiere alergias, diagnósticos ni perfiles sensibles, y nunca
garantiza ausencia de contaminación cruzada. Tests cubren catálogo vacío, disponibilidad,
restricciones incompatibles, ranking estable, localización, privacidad y degradación segura.
