# Contrato API — SPEC-032

`GET /v1/entitlements` devuelve derechos/cuotas efectivos del tenant/contexto autorizado.
Filtros: code y branch scope; orden estable, ETag y revisión de cálculo. No permite writes.

La respuesta distingue boolean, quantity y scopes; no expone items comerciales innecesarios.
Una revisión stale puede usarse sólo para UI, nunca para autorizar una mutación. Backend
consumidor evalúa fuente autoritativa/servicio interno. Tests cubren conditional GET,
entitlement ausente, suspensión, scope, minimización y cross-tenant.
