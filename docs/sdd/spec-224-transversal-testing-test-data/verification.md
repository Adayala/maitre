# Verificación — SPEC-224

## Criterios

### CAD-224-01 — Los tests representan riesgo real en la capa más barata y determinista posible

- [ ] defecto corregido incluye regresión en capa adecuada;
- [ ] E2E cubre sólo recorridos MVP críticos;
- [ ] la selección de capa evita evidencia cara o engañosa.

### CAD-224-02 — Unit, integration, API, UI y E2E tienen fronteras claras y sin mocks engañosos

- [ ] unit tests de domain/application corren sin red/DB;
- [ ] integration usa PostgreSQL compatible real;
- [ ] RLS prueba acceso positivo y negativo con dos tenants;
- [ ] API tests verifican schemas, Problem Details e idempotencia;
- [ ] UI tests usan roles/labels y axe;
- [ ] MSW falla ante requests inesperadas;
- [ ] adapter tests cubren mapping/error/timeout/reconciliación.

### CAD-224-03 — Los datos de prueba son sintéticos, mínimos, deterministas y multi-tenant por defecto

- [ ] fixtures/builders son sintéticos y mínimos;
- [ ] ningún artefacto contiene PII, credencial o certificado real;
- [ ] PR no puede contactar ARCA/pagos productivos.

### CAD-224-04 — Los contratos incompatibles entre API, eventos y clientes bloquean CI

- [ ] contract/API drift falla en la matriz correspondiente;
- [ ] los clientes se regeneran o validan contra la fuente aprobada;
- [ ] un cambio breaking incompatible no pasa CI.

### CAD-224-05 — La suite es reproducible, aislada y resistente a flake por diseño

- [ ] suite repetida con mismo seed produce igual resultado;
- [ ] tests corren en orden aleatorio/paralelo sin interferencia;
- [ ] clock/IDs controlan expiración y snapshots;
- [ ] no existen sleeps arbitrarios ni dependencia de hora local;
- [ ] cleanup no deja datos entre ejecuciones;
- [ ] flake produce issue/evidencia y no se oculta con retries;
- [ ] reports incluyen seed, ambiente y artefactos sólo cuando aportan diagnóstico.

### CAD-224-06 — La estrategia de testing cabe dentro del presupuesto y se integra con la matriz única de calidad

- [ ] cobertura nueva y Sonar cumplen SPEC-207;
- [ ] duración/consumo permanece dentro de SPEC-208/221;
- [ ] cada suite se invoca mediante la matriz única de SPEC-207;
- [ ] un cambio compartido invalida filtros y ejecuta suites dependientes.

## Harness E2E reproducible

La aceptación detallada, la topología y los criterios del harness se mantienen en
[Cobertura E2E de flujos entre aplicaciones](../../foundation/20-e2e-flow-coverage.md). Ningún
perfil release se considera operativo hasta demostrar equivalencia local/CI, aislamiento Tenant
A/B, cleanup, bloqueo pre-deploy e identidad entre el artefacto probado y el desplegado.
