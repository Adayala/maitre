# Especificación — SPEC-228

## Definición formal

```json
{
  "code": "SEATS",
  "name": "Plazas",
  "description": "Descripción comercial extensa de la capacidad...",
  "benefits": ["Beneficio verificable", "Beneficio operativo"],
  "billingType": "SERVICE | QUANTITY",
  "billingScope": "TENANT | BRAND | FISCAL_ENTITY | BRANCH | POS | CONNECTOR",
  "unitPrice": 500,
  "currency": "ARS",
  "period": "MONTHLY",
  "dependsOn": ["FLOOR"],
  "isActive": true,
  "version": 1
}
```

`code` es la clave primaria estable. `unitPrice` es fijo por servicio o por unidad según
`billingType`. `dependsOn` contiene códigos del mismo catálogo. `description` explica qué incluye
el servicio y su modalidad de contratación; `benefits` contiene ventajas comerciales concretas
mostradas en la experiencia de suscripción.

## Persistencia

La tabla canónica es `subscription_catalog_items`. El catálogo es una referencia compartida,
legible por sesiones autenticadas y modificable sólo por procesos internos.
