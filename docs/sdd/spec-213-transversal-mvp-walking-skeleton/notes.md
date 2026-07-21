# Decisiones — SPEC-213

## Por qué este recorrido

La consulta del contexto autenticado es pequeña pero prueba las fronteras de mayor riesgo: identidad externa, autorización propia, multi-tenancy, contratos, persistencia, UI y despliegue.

A diferencia de un health check aislado, produce una base que las siguientes features pueden extender.

## Decisiones

- Dash es la primera superficie porque permite verificar acceso administrativo sin introducir todavía complejidad de tiempo real de Floor o Kitchen.
- Se evita un registro público en el primer corte; los datos demo se aprovisionan de forma controlada.
- Liveness y readiness se separan para no reiniciar procesos sanos por fallos transitorios de dependencias.
- No se crean módulos futuros vacíos ni endpoints placeholder.
- La primera feature de negocio posterior debe construirse sobre este corte, no en un segundo stack paralelo.
- `/v1/me/context` es un endpoint de descubrimiento: no recibe tenant/branch seleccionados y no expande permisos o entitlements.
- Un User válido sin memberships activas es un estado funcional vacío, no un fallo de autenticación.

## Riesgos a observar

- Drift entre Auth y la entidad User del dominio.
- Policies RLS que otorguen acceso por omisión.
- Previews que consuman cuotas o contaminen datos demo.
- Telemetría que capture PII o tokens.
- Shell abstraído prematuramente antes de validar una segunda app.
