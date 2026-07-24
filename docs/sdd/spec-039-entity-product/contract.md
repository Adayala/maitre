# Contrato — SPEC-039 Product

Product representa una definición reutilizable del catálogo, separada de MenuItem y del item
capturado en una orden. Campos: id, tenantId, name, description, tax category default, allergens,
dietary/nutrition declarations, modifier/media references, editorial status, version y auditoría.

Precio/currency/posición/overrides pertenecen a MenuItem y se congelan al publicar. Cambios
posteriores de Product no alteran revisiones publicadas u órdenes. Allergen/dietary data se trata
como información declarada, con provenance y advertencia, no garantía médica. Availability y stock
operativo son proyecciones separadas. Tests cubren reuse, snapshot, declarations, media refs,
lifecycle e isolation.
