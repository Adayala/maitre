# Contrato API — SPEC-131 Discounts

Crear, listar, versionar, publicar y desactivar descuentos; evaluar elegibilidad y aplicar una
versión a una cuenta mediante comandos idempotentes. La API devuelve desglose explicable y no
confía en importes calculados por el cliente. If-Match protege cambios. Tests cubren vigencia,
timezone, stacking, límites, uso repetido, catálogo modificado, concurrencia, RBAC, auditoría
y aislamiento entre tenants.
