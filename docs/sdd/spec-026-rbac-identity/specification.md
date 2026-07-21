# Especificación — SPEC-026

## Permission Matrix

```
Operation       OWNER  ADMIN  MANAGER  EMPLOYEE
user:create     ✓      ✓      ✗        ✗
user:read       ✓      ✓      ✓        ✓
user:write      ✓      ✓      ✗        ✗
role:read       ✓      ✓      ✓        ✓
perm:read       ✓      ✓      ✓        ✓
```

OWNER > ADMIN > MANAGER > EMPLOYEE
