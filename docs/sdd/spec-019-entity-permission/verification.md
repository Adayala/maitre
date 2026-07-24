# Verificación — SPEC-019

## Criterios

### CAD-019-01 — Todo código cumple el formato lower-case `resource.action`, es único e inmutable

- [ ] todos los códigos cumplen formato `resource.action`;
- [ ] el catálogo no tiene duplicados;
- [ ] renombrar requiere successor explícito.

### CAD-019-02 — No existen wildcards en assignments persistidos I0 ni permissions creadas por clientes/tenants

- [ ] no existen wildcards persistidos en I0;
- [ ] clientes/tenants no crean permissions;
- [ ] el catálogo es controlado por plataforma.

### CAD-019-03 — Un permiso desconocido, deprecated sin migration o alcance insuficiente produce deny-by-default

- [ ] permiso desconocido falla cerrado;
- [ ] permiso deprecated sin migración válida falla cerrado;
- [ ] alcance insuficiente no autoriza.

### CAD-019-04 — Cada endpoint/command sensible referencia un código de permiso existente y además evalúa reglas de dominio/segregación

- [ ] endpoints sensibles referencian códigos existentes;
- [ ] además se evalúan reglas de dominio;
- [ ] el código de permiso por sí solo no alcanza para autorizar.

### CAD-019-05 — Renombrar/deprecar crea successor y migra roles/consumidores preservando historia

- [ ] deprecación crea successor cuando aplica;
- [ ] migraciones preservan historia;
- [ ] consumidores pueden coexistir durante transición.

### CAD-019-06 — Acciones sensibles autorizadas y denegadas producen auditoría sin exponer tokens, claims ni PII innecesaria

- [ ] autorizaciones y denegaciones sensibles producen auditoría;
- [ ] logs no exponen tokens o claims innecesarios;
- [ ] la auditoría minimiza PII.
