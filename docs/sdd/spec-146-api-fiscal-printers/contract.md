# Contrato API — SPEC-146 Fiscal Printers

Registrar, listar, configurar por referencia, activar, probar y retirar impresoras fiscales.
La API nunca recibe ni devuelve secretos persistidos; test-connection es auditable, acotado y
no emite comprobantes reales. If-Match protege configuración y los comandos son idempotentes.
Tests cubren dispositivo duplicado, offline, timeout, configuración inválida, retiro con cola,
RBAC, redacción y aislamiento entre tenants.
