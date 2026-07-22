# Especificación — SPEC-180 Connector Status API

Read model por integration/capability: configured/credential state, last success/attempt, freshness,
checkpoint lag, quota, degradation y normalized errors con `asOf`. No ejecuta network checks al leer.

Sensitive provider detail, subjects y secret refs se redactan. Estado global se deriva conservando
degradación parcial; UNKNOWN/STALE no se presenta como healthy. Cache scope incluye tenant/permisos.
