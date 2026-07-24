# Rules — SPEC-033

- El hecho emitido es inmutable; correcciones crean eventos/revisions posteriores.
- v1 usa nombre/version canónicos; breaking change crea v2.
- Consumidores deduplican por eventId y convergen por source revision.
- Scope/IDs pertenecen al mismo Tenant.
- El evento no concede autorización ni capacidad por sí solo.
