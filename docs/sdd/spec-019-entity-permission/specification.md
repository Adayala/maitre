# Especificación — SPEC-019

## Schema lógico

```json
{
  "code": "membership.invite",
  "resource": "membership",
  "action": "invite",
  "descriptionKey": "permission.membership.invite",
  "sensitivity": "HIGH",
  "status": "ACTIVE",
  "successorCode": null,
  "catalogVersion": 1
}
```

`code` es la identidad canónica y debe coincidir con `resource + "." + action`. El formato con `:`
queda descartado para códigos normativos. Labels/descripciones localizadas no participan en
autorización.

El catálogo no es CRUD tenant-scoped y no admite wildcards persistidos en I0.
