# Especificación — SPEC-036

## Permission Matrix

```
Operation           OWNER  ADMIN  MANAGER  EMPLOYEE
subscription:read   ✓      ✓      ✓        ✗
service:manage      ✓      ✓      ✗        ✗
plan:upgrade        ✓      ✗      ✗        ✗
entitle:read        ✓      ✓      ✓        ✗
quota:read          ✓      ✓      ✓        ✗
```

OWNER > ADMIN > MANAGER > EMPLOYEE
