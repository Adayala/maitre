# Estructura — SPEC-065

Decisión lógica:

1. autenticar actor y validar sesión/step-up cuando corresponda;
2. resolver Membership ACTIVE y `authorizationRevision`;
3. resolver permission exacta desde el catálogo versionado;
4. intersectar tenant, Branch y assignment scope;
5. evaluar LimitsPolicyVersion y ApprovalPolicyVersion;
6. ejecutar invariantes del dominio y control de revisión;
7. registrar decisión sensible y resultado con redacción.

El middleware sólo extrae contexto y aplica el resultado. La aplicación solicita una decisión
tipada por acción/recurso; el dominio conserva sus invariantes. Los perfiles de rol
materializan assignments pero no participan como comparación jerárquica en runtime.
