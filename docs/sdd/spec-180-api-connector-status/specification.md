# Especificación — SPEC-180 Connector Status API

Read model por integration/capability: configured/credential state, last success/attempt, freshness,
checkpoint lag, quota, degradation y normalized errors con `asOf`. No ejecuta network checks al leer.

Sensitive provider detail, subjects y secret refs se redactan. Estado global se deriva conservando
degradación parcial; UNKNOWN/STALE no se presenta como healthy. Cache scope incluye tenant/permisos.

`GET /connector-status` lista estado resumido por integración/capability y `GET
/connector-status/{integrationId}` devuelve detalle derivado. Las respuestas incluyen `asOf` y
metadata suficiente para interpretar si el estado es reciente, degradado o inconcluso. La API no
lanza probes en lectura ni “arregla” estado viejo al consultarlo.

El read model debe poder representar diferencias entre credencial válida pero sync stale, webhook
activo pero quota agotada, o capability disabled por policy. Esto evita colapsar varios tipos de
degradación en un único “healthy/unhealthy” pobremente informativo.
