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
