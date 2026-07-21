# Tareas — SPEC-216

- [x] Definir contrato documental de telemetría I0.
- [ ] Aprobar señales y SLIs I0; mantener SLOs `NOT_OPERATIONAL`.
- [ ] Implementar `TelemetryPort` y logger estructurado.
- [ ] Configurar OpenTelemetry y `traceparent`.
- [ ] Propagar correlationId en HTTP, jobs y eventos.
- [ ] Implementar allowlist y redacción con tests.
- [ ] Instrumentar HTTP, Auth/context y DB del walking skeleton.
- [ ] Evitar labels de alta cardinalidad mediante tests/lint.
- [ ] Implementar synthetic check del walking skeleton.
- [ ] Medir golden signals local/CI sin prometer dashboard durable.
- [ ] Seleccionar backend/canal antes de crear alertas operativas.
- [ ] Escribir runbooks mínimos de incidente.
- [ ] Probar DB caída, timeout, retry e identidad degradada.
- [ ] Probar detección de secreto canario y cross-tenant simulado.
- [ ] Medir overhead, volumen y consumo de free tier.
- [ ] Integrar evidencia de observabilidad al gate de release.
- [ ] Probar correlation ID inválido/ausente y propagación confiable.
- [ ] Medir volumen de logs y overhead por request en SPK-05.
