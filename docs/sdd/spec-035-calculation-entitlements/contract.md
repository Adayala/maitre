# Contrato de cálculo — SPEC-035

Entrada: Subscription vigente, items activos en fecha, catálogo de servicios/config y scope
tenant/sucursal, más overrides aprobados vigentes. Salida determinista: set de Entitlements con
sources y revisión. Cuota/consumo pertenece a SPEC-030 y no se calcula desde el contrato comercial.

Reglas: sólo items vigentes; los alcances se intersectan con sucursales del tenant; boolean usa OR,
cantidades usan agregación definida por code (nunca una suma implícita); conflicto de tipos
falla cerrado; suspensión/cancelación retira derechos según política explícita. Mismo input
produce mismos bytes lógicos. Fixtures cubren vacío, solapamiento, expiración, reducción,
config inválida, unlimited y multi-tenant. El cálculo no consulta reloj global: recibe `asOf`.
