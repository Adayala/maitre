# Historial de implementación SDD

Este índice conserva decisiones, diseños, requisitos incrementales y tareas de cambios ya
implementados. La fuente normativa vigente siempre es la SPEC dueña; estos paquetes explican por
qué y cómo se materializó un corte concreto, pero no crean una segunda jerarquía de specs.

Los paquetes históricos viven bajo:

```text
docs/sdd/spec-NNN-*/implementation-history/<change>/
├── proposal.md
├── design.md
├── requirements.md
└── tasks.md
```

## Cambios migrados

| Cambio                                               | SPEC dueña                                                  | Historial                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cliente reutilizable de facturación electrónica ARCA | [SPEC-145](spec-145-api-arca-integration/)                  | [add-arca-electronic-invoicing](spec-145-api-arca-integration/implementation-history/add-arca-electronic-invoicing/proposal.md)                                      |
| Journey MVP E2E autoritativo                         | [SPEC-224](spec-224-transversal-testing-test-data/)         | [add-authoritative-mvp-e2e-journey](spec-224-transversal-testing-test-data/implementation-history/add-authoritative-mvp-e2e-journey/proposal.md)                     |
| Pagos de cuentas pendientes en Cash                  | [SPEC-059](spec-059-api-payments/)                          | [add-cash-pending-payments](spec-059-api-payments/implementation-history/add-cash-pending-payments/proposal.md)                                                      |
| Auditoría de mutaciones sensibles del MVP            | [SPEC-045](spec-045-api-audit/)                             | [audit-mvp-sensitive-mutations](spec-045-api-audit/implementation-history/audit-mvp-sensitive-mutations/proposal.md)                                                 |
| Gobernanza completa del contrato HTTP/OpenAPI        | [SPEC-215](spec-215-transversal-http-api-standards/)        | [complete-http-contract-governance](spec-215-transversal-http-api-standards/implementation-history/complete-http-contract-governance/proposal.md)                    |
| Perfil de runtime durable                            | [SPEC-221](spec-221-transversal-ci-cd-release-management/)  | [enforce-durable-runtime-profile](spec-221-transversal-ci-cd-release-management/implementation-history/enforce-durable-runtime-profile/proposal.md)                  |
| Observabilidad operativa del MVP                     | [SPEC-216](spec-216-transversal-observability-reliability/) | [implement-mvp-operational-observability](spec-216-transversal-observability-reliability/implementation-history/implement-mvp-operational-observability/proposal.md) |

## Regla para cambios posteriores

1. La propuesta se registra primero en la SPEC dueña y respeta SPEC-225.
2. Cambios que afectan varias specs eligen una dueña principal y enlazan las afectadas.
3. El contrato aprobado se actualiza en los archivos normativos de la SPEC.
4. El historial de implementación es opcional y sólo conserva contexto que no pertenece al
   contrato vivo.
5. No se crean árboles documentales paralelos en la raíz del repositorio.

## Convenciones de implementación conservadas

- TypeScript ESM estricto y project references.
- Los módulos de dominio dependen de puertos; adapters y composition roots aportan
  infraestructura.
- Credenciales fiscales y claves privadas nunca se versionan, registran en logs, exponen al
  navegador ni guardan en filas tenant.
- Homologación y producción se seleccionan explícitamente para integraciones externas.
- Las pruebas usan el runner definido por el repositorio y los quality gates vigentes.
