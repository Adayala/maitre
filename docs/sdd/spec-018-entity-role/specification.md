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

`GUEST` no representa navegación pública anónima. En el baseline vigente se interpreta como un
perfil de cliente autenticable para superficies customer-facing futuras, distinto de los roles
internos operativos/administrativos. La consulta pública anónima de menú/promociones/sucursales no
se modela como `Role`: pertenece a endpoints/capabilities públicas sin Membership.

No existen `POST`, `PATCH` o `DELETE` con alcance tenant para Role en I0.
