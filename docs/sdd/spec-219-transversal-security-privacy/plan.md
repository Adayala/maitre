# Plan — SPEC-219

## Fase 1 — Modelo y baseline

1. Mapear activos, datos, actores, flujos y trust boundaries.
2. Crear threat model del walking skeleton y recorridos críticos.
3. Importar/mantener matriz ASVS 5.0.0 aplicable.
4. Clasificar entidades/campos y definir retención inicial.

## Fase 2 — Controles fundacionales

1. Endurecer identidad, sesión y autorización.
2. Implementar tenant context + RLS + tests negativos.
3. Configurar CSP, headers, CORS, CSRF y límites.
4. Implementar auditoría y redacción.

## Fase 3 — DevSecOps

1. Configurar SAST/Sonar, SCA, secret scan y workflow permissions.
2. Automatizar actualización y triage de dependencias.
3. Crear tests de abuso por API/feature.
4. Revisar artefactos, source maps y supply chain.

## Fase 4 — Gate de piloto

1. Ejecutar verificación ASVS L2 aplicable.
2. Realizar pentest/revisión independiente según riesgo.
3. Probar incidentes de secreto, tenant y sesión.
4. Resolver findings o aprobar excepciones temporales.
