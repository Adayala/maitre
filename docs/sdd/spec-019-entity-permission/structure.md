# Structure — SPEC-019

> **Estado:** antecedente no implementable. El catálogo global persistido propuesto está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitrepermissions--spec-019)
> y continúa pendiente de sign-off en OPEN-019.

Catálogo versionado definido por plataforma:

```
user.read, user.write
tenant.read, tenant.write
order.read, order.write
...
```

Los códigos usan `resource.action`. Esta spec no define un endpoint y no autoriza wildcards
persistidos.
