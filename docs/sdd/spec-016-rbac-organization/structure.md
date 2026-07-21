# Structure — RBAC

## Role hierarchy

OWNER > ADMIN > MANAGER > EMPLOYEE

## Permission matrix

| Resource | OWNER | ADMIN | MANAGER | EMPLOYEE |
| --- | --- | --- | --- | --- |
| Tenant | CRU* | - | - | - |
| Brand | CRU | CRU | R | - |
| Branch | CRU | CRU | R | - |
| Salon | - | CRU | R | - |
| Table | - | - | - | - |

C=Create, R=Read, U=Update, *=with restrictions
