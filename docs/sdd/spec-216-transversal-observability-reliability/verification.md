# Verificación — SPEC-216

## Criterios

### CAD-216-01 — La telemetría permite correlación útil de extremo a extremo sin acoplar el dominio a un SaaS

- [ ] una acción de UI se correlaciona con API, caso de uso y DB;
- [ ] un webhook/job conserva causalidad cuando el protocolo la soporta;
- [ ] routes y spans no incorporan IDs en el nombre;
- [ ] sampling mantiene errores críticos según configuración;
- [ ] correlation ID ausente/inválido se reemplaza y aparece en header/envelope/log.

### CAD-216-02 — Logs, métricas y trazas siguen allowlists y redacción estricta

- [ ] tests canarios prueban que secretos se redactan;
- [ ] tokens, cookies, PII y payloads sensibles no aparecen en señales;
- [ ] acceso a telemetría respeta mínimo privilegio;
- [ ] retención y exportación están documentadas por ambiente;
- [ ] el logger rechaza campos fuera de allowlist y tests inspeccionan output completo.

### CAD-216-03 — SLOs, SLIs y alertas sólo pueden declararse operativos con backend, owner y prueba verificable

- [ ] SLIs experimentales se calculan desde fuentes reproducibles o reportan `NO_DATA`;
- [ ] ventanas sin volumen no reportan éxito ficticio;
- [ ] alerta sintética notifica una vez, enlaza runbook y se resuelve;
- [ ] burn rate distingue degradación breve de riesgo sostenido;
- [ ] ninguna condición se etiqueta `OPERATIONAL` sin backend, owner, canal y entrega probada.

### CAD-216-04 — La resiliencia incluye timeouts, retries, degradación explícita y readiness segura

- [ ] timeouts respetan el presupuesto end-to-end;
- [ ] retries incluyen backoff/jitter y no duplican efectos;
- [ ] dependencia degradable produce estado explícito;
- [ ] readiness falla de forma segura ante dependencia esencial caída.

### CAD-216-05 — La observabilidad cabe dentro del presupuesto y del perímetro MVP

- [ ] cuotas generan aviso antes de bloquear el free tier;
- [ ] instrumentación I0 no excede el presupuesto de overhead aprobado;
- [ ] exportación y retención respetan el perímetro del MVP.

### CAD-216-06 — Game days, runbooks y postmortems producen acciones verificables

- [ ] game day produce timeline, hallazgos y acciones verificables;
- [ ] los runbooks vinculados son accionables;
- [ ] los follow-ups quedan trazados con evidencia enlazada.
