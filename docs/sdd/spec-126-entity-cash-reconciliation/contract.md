# Contrato de entidad — SPEC-126 Cash Reconciliation

CashReconciliation compara por medio de pago los importes esperados y declarados de una sesión,
registrando diferencias, evidencia y estado DRAFT/SUBMITTED/APPROVED/REJECTED. Submit congela
inputs y versión; aprobación requiere actor distinto cuando rige segregación. Tests cubren
reconteo, diferencias, moneda, concurrencia, rechazo y reenvío, evidencia, auditoría y
aislamiento entre tenants.
