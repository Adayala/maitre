# Structure — SPEC-018

Roles are read-only, hardcoded in application.

```
const ROLES = {
  OWNER: { name: "Owner", permissions: ["*"] },
  ADMIN: { name: "Admin", permissions: ["tenant:write", "branch:write", ...] },
  ...
}
```
