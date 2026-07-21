# Decisiones — SPEC-216

## Decisiones

- OpenTelemetry conserva portabilidad y evita instrumentación propietaria en el núcleo.
- RED (rate, errors, duration) es el punto de partida para servicios; señales de saturación se agregan donde el runtime las exponga.
- SLOs iniciales son hipótesis internas y deben recalibrarse con baseline.
- Se prefieren alertas por impacto/burn rate sobre umbrales aislados.
- El free tier puede limitar retención o dashboards, pero no justifica omitir correlación, redacción ni métricas básicas.
- I0 usa stdout JSON, exporter in-memory/local y evidencia CI; no hay backend SaaS ni paging adoptado.
- Los SLOs numéricos son hipótesis de diseño hasta contar con volumen y fuente durable.

## Riesgos

- Exceso de logs que agote cuota sin mejorar diagnóstico.
- PII o datos fiscales capturados por instrumentación automática.
- Cardinalidad causada por IDs, URLs o mensajes variables.
- Alert fatigue antes de existir guardia formal.
- Health verde mientras el recorrido real está roto.

## Próximas decisiones

- Backend/exporter inicial según compatibilidad y cuota vigente.
- Canal de alertas y guardia cuando exista equipo operativo.
- Retención formal por ambiente y clasificación.
- SLOs específicos para pedidos, cocina, pagos y ARCA.
