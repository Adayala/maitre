# Especificación — SPEC-229

```json
{
  "code": "ESENCIAL",
  "name": "Esencial",
  "tagline": "Más capacidad comercial a un precio accesible",
  "description": "Explicación completa de la propuesta...",
  "benefits": ["Beneficio comercial", "Beneficio operativo"],
  "items": [
    { "catalogItemCode": "CORE" },
    { "catalogItemCode": "SEATS", "quantity": 40 }
  ],
  "isActive": true,
  "sortOrder": 20,
  "version": 1
}
```

La tabla canónica es `subscription_catalog_packages`. `items` es un arreglo JSON versionado de
referencias a SPEC-228; el precio mostrado se deriva del catálogo vigente.
