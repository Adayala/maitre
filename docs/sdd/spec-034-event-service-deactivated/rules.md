# Rules — SPEC-034

- El hecho emitido es inmutable; breaking change crea v2.
- Consumidores deduplican por eventId y convergen por source revision.
- IDs/scopes pertenecen al mismo Tenant.
- Reason es código canónico, no texto sensible.
- El evento no borra datos, cancela trabajo ni concede/retira permiso directamente.
