# Contrato de entidad — SPEC-127 Discount

Discount define una reducción fija o porcentual con moneda o límite, vigencia, alcance,
combinabilidad, prioridad y condiciones versionadas. Los porcentajes permanecen acotados y el
descuento aplicado nunca vuelve negativo el subtotal elegible; publicar congela la versión
usada por cada cuenta. Tests cubren solapamientos, timezone, redondeo, stacking, topes,
desactivación, reproducibilidad y aislamiento entre tenants.
