# Reglas — SPEC-174

- Inbound y outbound son entidades y permisos separados.
- Outbound aplica SSRF controls en cada entrega.
- Inbound verifica firma, timestamp y replay antes de encolar.
- Secretos y retries no se comparten entre ambos lados.
- Deliveries/receipts son evidencia operativa, no autoridad funcional.
