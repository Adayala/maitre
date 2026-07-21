# Reglas — SPEC-224

## Invariantes

1. Cada criterio de aceptación tiene evidencia trazable.
2. Domain/application unit tests no usan infraestructura real.
3. SQL, migrations y RLS se prueban contra PostgreSQL real.
4. Tests cross-tenant usan al menos dos scopes distintos.
5. Frontend se prueba por comportamiento observable, no implementación.
6. Fixtures/builders contienen sólo datos sintéticos.
7. Tiempo, IDs y random se controlan cuando afectan el resultado.
8. Tests no dependen de orden, sleeps arbitrarios o residuos compartidos.
9. Un mock no demuestra que una integración real cumple contrato.
10. Flaky tests no se ignoran ni reintentan indefinidamente.
11. Coverage es gate/señal, no sustituto de assertions.
12. PRs no llaman proveedores fiscales/pagos reales.
13. La estrategia de test no duplica comandos ni triggers definidos por SPEC-207.
14. Un filtro por cambios afectados debe demostrar que no omite evidencia relevante.

## Excepciones

Una cuarentena o exclusión de cobertura requiere razón, owner, issue, vencimiento y evidencia compensatoria. Código de negocio no se excluye sólo para alcanzar el umbral.
