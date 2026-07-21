# Contrato de entidad — SPEC-125 Cash Movement

CashMovement es un registro inmutable de ingreso, egreso o ajuste asociado a una sesión de
caja, con importe decimal positivo, moneda, categoría, referencia, actor y motivo. Correcciones
se expresan como movimientos compensatorios y nunca por edición o borrado. Tests cubren signos,
moneda incompatible, sesión cerrada, duplicados, compensación, concurrencia, trazabilidad y
aislamiento entre tenants.
