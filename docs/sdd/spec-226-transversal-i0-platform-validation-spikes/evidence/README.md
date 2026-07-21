# Registro de ejecución — SPEC-226

Este directorio conserva resultados reproducibles de los spikes. Crear la plantilla no constituye evidencia técnica.

| Spike | Estado inicial | Resultado requerido por |
| --- | --- | --- |
| [SPK-01](SPK-01.md) | NOT_RUN | ADR-003 |
| [SPK-02](SPK-02.md) | NOT_RUN | ADR-002/003 |
| [SPK-03](SPK-03.md) | NOT_RUN | ADR-002 |
| [SPK-04](SPK-04.md) | NOT_RUN | ADR-002/003 |
| [SPK-05](SPK-05.md) | NOT_RUN | ADR-003 |
| [SPK-06](SPK-06.md) | NOT_RUN | ADR-002 |

## Reglas

- Estados válidos: `NOT_RUN | PASS | FAIL | INCONCLUSIVE`.
- El ejecutor completa fecha, commit, ambiente, versiones, comandos, mediciones y cleanup.
- Un reviewer confirma que la evidencia soporta el resultado.
- No se copian secrets, tokens, connection strings, datos personales o outputs sin sanitizar.
- Links a CI/artifacts deben respetar retención y acceso; el resumen durable queda versionado.
