# Contrato de entidad — SPEC-124 Cash Register

CashRegister configura una caja física o lógica por Branch y no guarda el saldo corriente.
CashSession es el agregado autoritativo de cada apertura, con currency, responsables, opening,
cutoff, ledger revision y lifecycle OPEN/CLOSING/CLOSED/RECONCILED. Sólo admite una sesión abierta
por register/currency. Tests cubren doble apertura, suspensión, concurrencia, precisión monetaria,
auditoría y aislamiento.
