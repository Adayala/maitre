# Contrato RBAC — SPEC-206 Analytics

Separar permisos para consultar agregados, drill-down, diseñar métricas y dashboards, gestionar
alertas/modelos, exportar y aprobar automatizaciones. La autorización se reaplica en cada
consulta y widget según tenant, sucursal y sensibilidad. Tests matriciales cubren operator,
manager, analyst, ML admin y tenant admin, escalamiento, supresión y revocación.
