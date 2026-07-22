# Contrato de dependencias y catálogo canónico — Identity

## DAG

| Spec | Depende de |
| --- | --- |
| SPEC-017 User | SPEC-219 y port de identidad externa; no depende de Membership |
| SPEC-018 Role | SPEC-019 Permission |
| SPEC-019 Permission | SPEC-219 |
| SPEC-020 Membership | SPEC-001 Tenant, SPEC-017 User, SPEC-018 Role, SPEC-019 Permission |
| SPEC-021 Users API | SPEC-017, SPEC-020, SPEC-023, SPEC-026, SPEC-215 |
| SPEC-022 Roles API | SPEC-018, SPEC-019, SPEC-020, SPEC-026, SPEC-215 |
| SPEC-023 Auth API | SPEC-017, SPEC-020, SPEC-210, SPEC-219, SPEC-226/ADR-002 |
| SPEC-024 UserInvited | SPEC-020, SPEC-021, SPEC-217 |
| SPEC-025 UserAuthenticated | SPEC-017, SPEC-023, SPEC-217, SPEC-219 |
| SPEC-026 Identity RBAC | SPEC-018, SPEC-019, SPEC-020, SPEC-219 |

Esto rompe el ciclo SPEC-017↔020: User es modelo global independiente; Membership lo referencia.
La navegación desde User hacia memberships es query/application concern, no dependency del agregado.

## Códigos persistidos

Los role codes iniciales son ASCII uppercase: `OWNER`, `ADMIN`, `MAITRE`, `MANAGER`, `WAITER`,
`COOK`, `CASHIER`. `MAÎTRE` es únicamente display label localizado. Nuevos roles funcionales no se
crean como strings en módulos: se modelan mediante assignments de permissions o cambio versionado
del catálogo.

Permission usa lowercase `resource.action`; aliases requieren mapping/migration explícita. Seeds,
schemas, matrices y eventos persisten siempre el código canónico.

## Readiness

SPEC-017/020/023 con código existente conservan `IN_PROGRESS/BLOCKED` hasta revisión retroactiva.
`WALKING_SKELETON_I0` es fase/target. Owner/reviewer permanecen sin inventar y ninguna normalización
del DAG equivale a APPROVE.
