# Objetivo — SPEC-224

Detectar regresiones en la capa más barata que represente el riesgo, evitando suites lentas, mocks engañosos y datos de prueba imposibles de mantener.

## Resultados esperados

- Reglas de dominio verificadas en milisegundos y sin infraestructura.
- SQL, RLS y migraciones probados contra PostgreSQL real.
- UI probada por comportamiento observable y accesibilidad.
- Contratos API/evento incompatibles bloqueados en CI.
- E2E enfocados en recorridos MVP, no en cada combinación.
- Fallos reproducibles con seed, reloj, IDs y contexto visibles.

## Fuera de alcance

- Alcanzar cobertura mediante assertions triviales.
- Mockear PostgreSQL para afirmar que SQL/RLS funciona.
- Replicar producción en cada test.
- Guardar snapshots masivos o datos reales anonimizados de forma informal.

## Criterios de aceptación

### CAD-224-01 — Los tests representan riesgo real en la capa más barata y determinista posible

Cada comportamiento se prueba en la capa mínima que capture el riesgo sin inflar costo ni latencia. El objetivo es evidencia útil, no cantidad artificial de tests.

### CAD-224-02 — Unit, integration, API, UI y E2E tienen fronteras claras y sin mocks engañosos

El dominio y la aplicación se prueban sin red ni DB, mientras repositorios, migraciones, RLS, rutas y recorridos críticos usan mecanismos realistas. Mockear infraestructura crítica no reemplaza evidencia de integración.

### CAD-224-03 — Los datos de prueba son sintéticos, mínimos, deterministas y multi-tenant por defecto

Fixtures y builders usan datos sintéticos, controlados por seed, reloj, IDs y scope. No se aceptan credenciales reales, datos sensibles ni snapshots imposibles de mantener.

### CAD-224-04 — Los contratos incompatibles entre API, eventos y clientes bloquean CI

OpenAPI, schemas, eventos y clientes deben detectar drift o cambios breaking. La evidencia de contrato es parte del gate de integración y no una verificación manual tardía.

### CAD-224-05 — La suite es reproducible, aislada y resistente a flake por diseño

Los tests no dependen del orden, la hora local ni sleeps arbitrarios. Un flaky test es un defecto gobernado y no se oculta con retries silenciosos.

### CAD-224-06 — La estrategia de testing cabe dentro del presupuesto y se integra con la matriz única de calidad

La duración, consumo y orquestación de suites respetan SPEC-207, SPEC-208 y SPEC-221. Cada suite se invoca desde la matriz raíz aprobada y mantiene trazabilidad con los cambios que cubre.
