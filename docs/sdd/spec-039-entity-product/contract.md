# Contrato — SPEC-039 Product

Product representa una oferta vendible del catálogo, separada del item capturado en una
orden. Campos: id, tenantId, name, description, price/currency, taxCategory, availability,
allergens, modifiers, media references, version y auditoría.

Precio usa minor units/decimal definido, nunca float. Publicación captura snapshot; cambios
posteriores no alteran órdenes. Allergen/dietary data se trata como información declarada,
con provenance y advertencia, no garantía médica. Disponibilidad y stock operativo son
proyecciones separadas. Tests cubren dinero, snapshot, scopes, validación y tenant isolation.
