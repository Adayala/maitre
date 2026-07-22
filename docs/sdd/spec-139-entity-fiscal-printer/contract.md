# Contrato de entidad — SPEC-139 Fiscal Printer

FiscalPrinter modela un dispositivo fiscal por sucursal con proveedor, modelo, identificador,
capacidades, configuración referenciada y estado ACTIVE/DEGRADED/OFFLINE/RETIRED. Secretos no
se almacenan en la entidad y cada cambio de configuración se versiona y audita. Tests cubren
unicidad, health stale, retiro con trabajos pendientes, rotación de configuración,
autorización y aislamiento entre tenants.
