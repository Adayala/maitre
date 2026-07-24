# Especificación — SPEC-083 OrderModifier

OrderModifier es parte del snapshot de OrderItem, no catálogo mutable. Guarda group/code, option
ID, labels, quantity, price delta neto/bruto, tax treatment y kitchen instruction tipada.

Antes de submit se valida contra la misma catalog revision del producto: pertenencia, vigencia,
min/max, exclusividad, duplicados y disponibilidad. Después de submit sólo cambia mediante un
OrderAdjustment que compensa precio, Check y producción. Texto libre se sanitiza, limita y nunca
sustituye códigos de alérgenos ni instrucciones con impacto de seguridad.

Cada modifier queda asociado a un único OrderItem y conserva tanto la identidad del group/option
del catálogo como sus labels resueltos y unidades comerciales al momento del submit. El snapshot
congelado debe ser suficiente para reconstruir la intención del cliente aunque el catálogo futuro
elimine o renombre esa opción.

`quantity` del modifier sigue las reglas de su grupo y del producto: puede ser implícita si la
opción es booleana o explícita si catálogo lo permite. Pricing usa dinero exacto con delta neto,
delta tax y delta gross, manteniendo la misma currency del OrderItem. Si la combinación de
modifiers altera routing culinario o station, ese efecto se expresa como metadata tipada, no como
texto libre opaco.

Kitchen instructions libres sólo se aceptan cuando la policy del group lo permite y bajo un tipo
explícito. Deben quedar acotadas por longitud, sanitizadas y sin reemplazar flags críticos de
alergia, cocción segura o restricciones médicas que requieren códigos o permisos específicos.
