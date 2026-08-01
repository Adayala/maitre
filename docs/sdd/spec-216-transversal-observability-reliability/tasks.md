# Tareas — SPEC-216

- [x] Definir contrato documental de telemetría I0.
- [ ] Aprobar señales y SLIs I0; mantener SLOs `NOT_OPERATIONAL`.
- [x] Implementar `TelemetryPort` y logger estructurado.
- [x] Configurar OpenTelemetry y `traceparent`.
- [x] Propagar correlationId en HTTP, jobs y eventos.
- [x] Implementar allowlist y redacción con tests.
- [x] Instrumentar HTTP, Auth/context y DB del walking skeleton.
- [x] Evitar labels de alta cardinalidad mediante tests/lint.
- [x] Implementar synthetic check del walking skeleton.
- [x] Medir golden signals local/CI sin prometer dashboard durable.
- [ ] Seleccionar backend/canal antes de crear alertas operativas.
- [x] Escribir runbooks mínimos de incidente.
- [ ] Probar DB caída, timeout, retry e identidad degradada.
- [x] Probar detección de secreto canario y cross-tenant simulado.
- [ ] Medir overhead, volumen y consumo de free tier.
- [x] Integrar evidencia de observabilidad al gate de release.
- [x] Probar correlation ID inválido/ausente y propagación confiable.
- [x] Medir volumen de logs y overhead por request en SPK-05.

El backend OTLP remoto, retención, dashboards, canal de paging, alertas entregadas y SLOs siguen
`NOT_OPERATIONAL` conforme a ADR-005. Las señales y el adapter existen y se validan localmente/CI;
eso no sustituye la operación remota pendiente. El benchmark mide overhead y volumen y proyecta
consumo, pero la tarea de free tier permanece abierta hasta seleccionar proveedor, cuota y
presupuesto aprobados.
