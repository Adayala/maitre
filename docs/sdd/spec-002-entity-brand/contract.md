# Contrato — SPEC-002

Brand es identidad comercial dentro de Tenant, separada de FiscalEntity y sucursal. Campos:
id, tenantId, name, slug interno, visual/contact config permitida, status, versión y auditoría.
Nombre/slug normalizados son únicos por tenant; no son dominio público global.

Brand no posee credenciales, facturación ni menú mutable embebido. Inactivar impide nuevas
branches/publicaciones pero conserva historia. Transferir entre tenants no está permitido.
Tests cubren unicidad Unicode/case, ciclo de vida, referencias activas, aislamiento entre tenants y
configuración sanitizada.
