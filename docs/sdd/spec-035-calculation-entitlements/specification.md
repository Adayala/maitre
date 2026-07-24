# Especificación — SPEC-035

## Algoritmo

```text
calculateEntitlements(input):
  1. validar schema/version/tenant/asOf de todas las fuentes
  2. seleccionar Subscription e items vigentes en asOf
  3. validar serviceCode/config/scope contra catálogo versionado
  4. expandir cada item a contributions tipadas por entitlement code
  5. agregar contributions con la policy específica del code
  6. aplicar overrides aprobados/vigentes según precedence del code
  7. producir Entitlements ordenados con sourceRefs y calculationRevision
  8. reemplazar la proyección completa de forma atómica
```

## Input lógico

```yaml
tenantId: <ID>
asOf: <UTC>
subscription: <snapshot versionado>
items: [<snapshots versionados>]
serviceCatalog: <catalog ID/version/hash>
entitlementCatalog: <catalog ID/version/hash>
overrides: [<records aprobados>]
calculationRevision: <algorithm/config ref>
```

## Precedence

Cada entitlement code declara:

```yaml
valueType: BOOLEAN | QUANTITY | ENUM | SCOPE_SET
aggregation: OR | MAX | MIN | SUM_EXPLICIT | INTERSECTION | UNION | REPLACE
overridePolicy: DENY | RESTRICT_ONLY | REPLACE_WITH_AUTHORITY
missingPolicy: DENIED | EMPTY | ERROR
```

`SUM_EXPLICIT` sólo es válido cuando el catálogo lo declara. No existe regla general “servicios
siempre aumentan límites” ni default de plan hardcodeado.

El output no calcula `used`, no persiste Quota y no autoriza una mutación sin revalidación.
