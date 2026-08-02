# Rules — SPEC-065

- Deny-by-default ante permiso, Membership, alcance, assignment, policy o revisión desconocidos.
- Role label nunca sustituye permiso efectivo y no existe wildcard persistido en I0.
- Tenant y Branch del recurso se validan contra el contexto; headers/body no amplían alcance.
- Read collection filtra por alcance antes de paginar; detail cross-scope responde `404`.
- WAITER sólo accede a assignment vigente y no puede autoasignarse para ampliar autoridad.
- Plaza y `waiterEmploymentId` son organización operativa, no grants de autoridad.
- Límites monetarios se evalúan en la currency/policy aprobada; fraccionar operaciones no
  elude el límite acumulado.
- Step-up y approval expiran, son action/resource-bound y no pueden reutilizarse.
- Solicitante no aprueba su propia operación cuando rige segregación.
- Auditoría no registra PII financiera, secretos ni razones libres no sanitizadas.
- Autorización exitosa no evita `If-Match`, idempotencia ni invariantes de dominio.
