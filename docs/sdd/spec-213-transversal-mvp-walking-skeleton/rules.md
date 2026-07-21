# Reglas — SPEC-213

## Invariantes

1. El incremento atraviesa todas las capas reales y se despliega; no se acepta una demo sólo frontend.
2. Ningún usuario puede enumerar o seleccionar un tenant o sucursal fuera de sus memberships.
3. La identidad del proveedor se traduce a identidad y autorización del dominio.
4. El navegador nunca recibe credenciales privilegiadas de Supabase.
5. Health endpoints no filtran secretos ni reemplazan monitoreo funcional.
6. Una migración reproduce el schema; el dashboard de Supabase no es fuente de verdad.
7. Todo contrato público se valida y aparece en OpenAPI sin duplicar tipos manuales.
8. El recorrido completo cumple gates de SPEC-207 y accesibilidad de SPEC-212.
9. La app maneja explícitamente loading, vacío, error, offline y sesión expirada.
10. El núcleo se ejecuta y prueba fuera de Vercel.

## Definition of Done

El walking skeleton está terminado sólo cuando una instalación limpia puede construirlo, migrarlo, probarlo y desplegarlo siguiendo documentación versionada, y cuando la evidencia de aislamiento cross-tenant forma parte de CI.
