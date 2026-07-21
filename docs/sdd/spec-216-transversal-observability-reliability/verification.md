# Verificación — SPEC-216

## Trazabilidad

- [ ] Una acción de UI se correlaciona con API, caso de uso y DB.
- [ ] Un webhook/job conserva causalidad cuando el protocolo la soporta.
- [ ] Routes y spans no incorporan IDs en el nombre.
- [ ] Sampling mantiene errores críticos según configuración.

## Privacidad y seguridad

- [ ] Tests canarios prueban que secretos se redactan.
- [ ] Tokens, cookies, PII y payloads sensibles no aparecen en señales.
- [ ] Acceso a telemetría respeta mínimo privilegio.
- [ ] Retención y exportación están documentadas por ambiente.

## SLO y alertas

- [ ] SLIs se calculan desde fuentes reproducibles.
- [ ] Ventanas sin volumen no reportan éxito ficticio.
- [ ] Alerta sintética notifica una vez, enlaza runbook y se resuelve.
- [ ] Burn rate distingue degradación breve de riesgo sostenido.
- [ ] Cuotas generan aviso antes de bloquear el free tier.

## Resiliencia

- [ ] Timeouts respetan el presupuesto end-to-end.
- [ ] Retries incluyen backoff/jitter y no duplican efectos.
- [ ] Dependencia degradable produce estado explícito.
- [ ] Readiness falla de forma segura ante dependencia esencial caída.
- [ ] Game day produce timeline, hallazgos y acciones verificables.
