# Objetivo — SPEC-213

Reducir temprano el riesgo de integración mediante un recorrido mínimo, real y desplegado que compruebe las decisiones de arquitectura antes de construir dominios operativos.

## Debe probar

- monorepo, dependencias y comandos raíz;
- build y navegación React.js;
- API Node.js portable entre Vercel y proceso estándar;
- autenticación y resolución de tenant/sucursal;
- migraciones, RLS y persistencia Supabase;
- contratos, validación, errores e idempotencia donde aplique;
- diseño compartido y accesibilidad;
- logs, métricas, trazas y correlación;
- CI, Sonar y despliegues preview dentro del free tier.

## No pretende

- entregar todavía reservas, pedidos, cocina, caja o facturación;
- crear todos los paquetes futuros;
- simular servicios externos;
- diseñar el dashboard final;
- usar datos productivos o credenciales personales.

## Criterios de aceptación

### CAD-213-01 — El walking skeleton recorre navegador, API, persistencia e identidad reales

El recorrido mínimo conecta web, API Node.js, contratos, autenticación, persistencia, RLS y despliegue realista. No se aceptan atajos que luego deban descartarse.

### CAD-213-02 — El flujo contractual mínimo descubre contexto autorizado sin confiar en headers de selección

`GET /v1/me/context` resuelve los tenants y branches autorizados desde identidad y memberships válidas. Los headers de selección sólo se usan luego y nunca conceden autoridad.

### CAD-213-03 — El esqueleto valida decisiones de arquitectura antes de expandir dominios operativos

El objetivo del corte es reducir riesgo de integración y no entregar funcionalidades completas de producto. Los límites de arquitectura deben quedar probados antes de escalar el desarrollo.

### CAD-213-04 — El recorrido comparte diseño, accesibilidad y observabilidad desde I0

La UI del esqueleto usa componentes y convenciones comunes, incluye accesibilidad básica verificable y produce correlación observacional útil de extremo a extremo.

### CAD-213-05 — La ejecución es portable entre local, preview y demo sin romper el free tier

El mismo commit debe funcionar en local y en despliegues compartidos aprobados, manteniéndose dentro del presupuesto y perímetro de SPEC-208.

### CAD-213-06 — La salida del skeleton deja evidencia ejecutable, no sólo intención documental

El corte sólo se considera válido con evidencia enlazada de pruebas, OpenAPI, accesibilidad, despliegue, rollback y runbooks mínimos reproducibles.
