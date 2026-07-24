# Structure — SPEC-018

> **Estado:** antecedente no implementable. El catálogo global persistido propuesto está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitreroles--spec-018)
> y continúa pendiente de sign-off en OPEN-018.

Roles are read-only, hardcoded in application.

```
const ROLES = {
  OWNER: { name: "Owner", permissions: ["*"] },
  ADMIN: { name: "Admin", permissions: ["tenant:write", "branch:write", ...] },
  ...
}
```
