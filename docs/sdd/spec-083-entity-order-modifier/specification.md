# Especificación — SPEC-083 OrderModifier

OrderModifier es parte del snapshot de OrderItem, no catálogo mutable. Guarda group/code, option
ID, labels, quantity, price delta neto/bruto, tax treatment y kitchen instruction tipada.

Antes de submit se valida contra la misma catalog revision del producto: pertenencia, vigencia,
min/max, exclusividad, duplicados y disponibilidad. Después de submit sólo cambia mediante un
OrderAdjustment que compensa precio, Check y producción. Texto libre se sanitiza, limita y nunca
sustituye códigos de alérgenos ni instrucciones con impacto de seguridad.
