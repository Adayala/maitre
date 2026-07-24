# Contrato API — SPEC-032

`GET /v1/entitlements` devuelve derechos/cuotas efectivos del tenant/contexto autorizado.
Filtros: code y alcance por sucursal; orden estable, ETag y revisión de cálculo. No permite writes.

La respuesta distingue boolean, quantity y alcances; no expone items comerciales innecesarios.
Una revisión stale puede usarse sólo para UI, nunca para autorizar una mutación. Backend
consumidor evalúa fuente autoritativa/servicio interno. Tests cubren conditional GET,
entitlement ausente, suspensión, alcance, minimización y cross-tenant.
