# Verificación — SPEC-224

## Determinismo y aislamiento

- [ ] Suite repetida con mismo seed produce igual resultado.
- [ ] Tests corren en orden aleatorio/paralelo sin interferencia.
- [ ] Clock/IDs controlan expiración y snapshots.
- [ ] No existen sleeps arbitrarios ni dependencia de hora local.
- [ ] Cleanup no deja datos entre ejecuciones.

## Capas

- [ ] Unit tests de domain/application corren sin red/DB.
- [ ] Integration usa PostgreSQL compatible real.
- [ ] RLS prueba acceso positivo y negativo con dos tenants.
- [ ] API tests verifican schemas, Problem Details e idempotencia.
- [ ] UI tests usan roles/labels y axe.
- [ ] E2E cubre sólo recorridos MVP críticos.

## Datos y proveedores

- [ ] Fixtures/builders son sintéticos y mínimos.
- [ ] Ningún artefacto contiene PII, credencial o certificado real.
- [ ] MSW falla ante requests inesperadas.
- [ ] Adapter tests cubren mapping/error/timeout/reconciliación.
- [ ] PR no puede contactar ARCA/pagos productivos.

## Calidad de suite

- [ ] Cobertura nueva y Sonar cumplen SPEC-207.
- [ ] Defecto corregido incluye regresión en capa adecuada.
- [ ] Flake produce issue/evidencia y no se oculta con retries.
- [ ] Reports incluyen seed, ambiente y artefactos sólo cuando aportan diagnóstico.
- [ ] Duración/consumo permanece dentro de SPEC-208/221.
- [ ] Cada suite se invoca mediante la matriz única de SPEC-207.
- [ ] Un cambio compartido invalida filtros y ejecuta suites dependientes.
