# Rules — RBAC

- OWNER can manage all
- ADMIN can create resources
- MANAGER can view
- EMPLOYEE has no org access

Authorization middleware checks:
1. User authenticated
2. User in tenant
3. User role
4. Permission for action+resource
