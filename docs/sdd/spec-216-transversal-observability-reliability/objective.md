# Objetivo — SPEC-216

Hacer que los fallos se descubran por evidencia antes que por reportes ambiguos de usuarios, preservando privacidad, portabilidad y presupuesto.

## Resultados esperados

- Correlación desde una acción de UI hasta API, base de datos e integración.
- Indicadores de disponibilidad, latencia, errores y saturación.
- SLOs diferenciados por recorrido crítico.
- Diagnóstico sin tokens, PII innecesaria ni payloads fiscales completos.
- Alertas con owner, severidad, condición y runbook.
- Recuperación y postmortems que produzcan mejoras verificables.

## Fuera de alcance

- Comprar observabilidad antes de medir necesidad.
- Registrar todo request/body por defecto.
- Usar logs como auditoría fiscal o de negocio.
- Prometer SLA comercial durante el MVP.
- Declarar alertas, dashboards o SLOs operativos sin backend, owner, canal y prueba end-to-end.
- Instrumentar dominios no incluidos en el walking skeleton.
