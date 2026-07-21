# Contrato de cálculo — SPEC-035

Entrada: Subscription vigente, items activos en fecha, catálogo de servicios/config y scope
tenant/branch. Salida determinista: set de Entitlements/Quotas con sources y revisión.

Reglas: sólo items vigentes; scopes se intersectan con branches del tenant; boolean usa OR,
cantidades usan agregación definida por code (nunca una suma implícita); conflicto de tipos
falla cerrado; suspensión/cancelación retira derechos según política explícita. Mismo input
produce mismos bytes lógicos. Fixtures cubren vacío, solapamiento, expiración, reducción,
config inválida, unlimited y multi-tenant. El cálculo no consulta reloj global: recibe `asOf`.
