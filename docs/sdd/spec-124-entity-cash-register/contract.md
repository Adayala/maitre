# Contrato de entidad — SPEC-124 Cash Register

CashRegister representa una caja física o lógica de una sucursal, con moneda, identificador
único por branch, responsables y estado CLOSED/OPEN/SUSPENDED. Sólo admite una sesión abierta
por caja; apertura y cierre conservan saldo declarado, versión y actor. Tests cubren doble
apertura, cambio de responsable, suspensión con actividad, concurrencia, precisión monetaria,
auditoría y aislamiento entre tenants.
