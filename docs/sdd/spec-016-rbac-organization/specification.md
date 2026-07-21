# Especificación — SPEC-016

## Organization RBAC

### Roles

- OWNER: Create tenant, manage admins
- ADMIN: Create brand, fiscal entity, branch
- MANAGER: View configuration
- EMPLOYEE: Cannot manage organization

### Permissions

| Role | Create Tenant | Create Brand | Create Branch | View | Edit |
| --- | --- | --- | --- | --- | --- |
| OWNER | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ❌ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ❌ | ❌ | ❌ | ✅ | ❌ |
| EMPLOYEE | ❌ | ❌ | ❌ | ❌ | ❌ |

## Enforcement

All API endpoints check:
1. User authenticated
2. User has role in tenant
3. User has permission for action
4. User has branch scope (if applicable)
