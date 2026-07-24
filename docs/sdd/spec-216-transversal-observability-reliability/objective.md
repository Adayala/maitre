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

## Criterios de aceptación

### CAD-216-01 — La telemetría permite correlación útil de extremo a extremo sin acoplar el dominio a un SaaS

Una acción de usuario puede correlacionarse con UI, API, caso de uso, DB e integración cuando aplique. La implementación usa puertos y configuraciones reemplazables, no dependencia lógica de un backend observacional específico.

### CAD-216-02 — Logs, métricas y trazas siguen allowlists y redacción estricta

Las señales observacionales excluyen secretos, tokens, PII innecesaria y payloads sensibles. La telemetría no reemplaza auditoría ni se usa como almacenamiento indiscriminado.

### CAD-216-03 — SLOs, SLIs y alertas sólo pueden declararse operativos con backend, owner y prueba verificable

Sin backend observacional, owner, canal y entrega demostrada, una señal permanece como `NOT_OPERATIONAL` o equivalente. Las ventanas sin datos no se reportan como éxito ficticio.

### CAD-216-04 — La resiliencia incluye timeouts, retries, degradación explícita y readiness segura

Los timeouts respetan el presupuesto extremo a extremo, los retries usan políticas explícitas y las dependencias degradables exponen estado claro. La readiness falla de forma segura ante dependencias esenciales caídas.

### CAD-216-05 — La observabilidad cabe dentro del presupuesto y del perímetro MVP

La instrumentación y sus exportaciones no exceden el presupuesto de overhead y free tier aprobado. Las cuotas también se observan antes de bloquear el sistema.

### CAD-216-06 — Game days, runbooks y postmortems producen acciones verificables

La confiabilidad no termina en emitir señales: requiere runbooks, ejercicios controlados y follow-ups accionables con evidencia enlazada.
