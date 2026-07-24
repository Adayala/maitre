# Rules — SPEC-045

- Permission sensible y tenant scope requeridos; Role nominal no basta.
- Rango/filtros/limit son allowlisted y acotados.
- Cursor opaco, orden `occurredAt,id`; sin offset/total requerido.
- Redacción depende de classification/permission.
- Soporte cross-tenant usa capability temporal/plataforma y se audita.
- Export no es endpoint síncrono v1.
