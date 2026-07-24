# Especificación — SPEC-018

## Catálogo inicial

```json
{
  "code": "OWNER",
  "nameKey": "role.owner.name",
  "descriptionKey": "role.owner.description",
  "status": "ACTIVE",
  "permissionCodes": ["membership.invite"],
  "assignableBy": [],
  "catalogVersion": 1
}
```

Los códigos canónicos son:

```text
OWNER | ADMIN | MANAGER | MAITRE | WAITER | COOK | CASHIER | GUEST
```

`MAÎTRE` es únicamente una etiqueta localizada para `MAITRE`. El ejemplo no enumera todos los
permisos de OWNER ni autoriza wildcard persistido. La matriz completa debe provenir del catálogo
versionado y coincidir con SPEC-016/026.

No existen `POST`, `PATCH` o `DELETE` con alcance tenant para Role en I0.
