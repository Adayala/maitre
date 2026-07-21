# Reglas — SPEC-216

## Invariantes

1. Todo request posee correlationId y, cuando aplica, trace context.
2. Logs estructurados usan allowlist y nunca contienen secretos.
3. Métricas no usan labels de cardinalidad no acotada.
4. Audit logs y eventos de dominio no se mezclan con logs técnicos.
5. Una alerta sin owner y runbook no puede declararse operativa.
6. Health no revela configuración ni ejecuta trabajo de negocio.
7. Retries sólo ocurren con semántica segura e idempotencia demostrada.
8. Ningún fallback presenta datos inventados como confirmados.
9. SLO y error budget se calculan con ventanas y volumen explícitos.
10. Telemetría depende de contratos propios y puede cambiar de exporter.
11. Un incidente de aislamiento, secreto, dinero o fiscalidad se trata como alta severidad.
12. La instrumentación debe tener tests y presupuesto de costo/latencia.
