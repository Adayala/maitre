# SPECIFICATION — SPEC-207

## Flujo obligatorio Spec-Driven Development

```text
Problema
  -> spec DRAFT
  -> revisión de producto, dominio y arquitectura
  -> READY_FOR_IMPLEMENTATION
  -> plan y tasks trazables
  -> implementación
  -> verificación automática y funcional
  -> evidencia
  -> DONE
```

No se implementa comportamiento de producto sin una spec `READY_FOR_IMPLEMENTATION`. Un bug puede comenzar con un caso de regresión enlazado a la spec afectada.

## Trazabilidad

Cada pull request debe declarar:

- spec(s) implementadas o modificadas;
- criterios de aceptación cubiertos;
- tests que aportan evidencia;
- decisiones o desviaciones arquitectónicas;
- impacto en seguridad, tenancy, observabilidad y costo;
- documentación actualizada.

## Gates obligatorios de CI

| Gate | Requisito |
| --- | --- |
| Formato | Verificación automática, sin reescritura en CI |
| Lint | Cero errores; warnings nuevos no permitidos |
| Typecheck | TypeScript estricto, sin errores |
| Unit tests | Todos verdes |
| Integration tests | Verdes para contratos, datos e integraciones afectadas |
| Contract tests | APIs/eventos compatibles con la spec |
| Build | Reproducible para aplicaciones y paquetes afectados |
| Dependency audit | Sin vulnerabilidades críticas o altas sin excepción aprobada |
| Secret scan | Sin credenciales ni material sensible |
| Sonar | Quality Gate aprobado en código nuevo |
| Spec validation | Links, estructura y criterios requeridos válidos |

## SonarQube / SonarCloud

El análisis se ejecuta sobre pull requests y rama principal. Para mantener costo cero se admite SonarCloud cuando el repositorio y su licencia sean elegibles; SonarQube Community puede ejecutarse fuera del camino crítico si requiere infraestructura persistente.

El Quality Gate para código nuevo exige inicialmente:

- cero issues `BLOCKER` o `CRITICAL`;
- cero vulnerabilidades nuevas;
- Security Hotspots revisados al 100%;
- cobertura de código nuevo >= 80%;
- duplicación en código nuevo <= 3%;
- maintainability rating A;
- reliability rating A;
- security rating A.

Los umbrales pueden endurecerse mediante ADR, nunca relajarse silenciosamente.

## Estrategia de tests

- **Unitarios:** reglas de dominio, cálculos y servicios de aplicación.
- **Integración:** repositorios, migraciones, adaptadores y transacciones.
- **Contrato:** requests/responses, eventos, webhooks y proveedores externos.
- **E2E:** pocos recorridos críticos, estables y orientados a valor.
- **Regresión:** obligatorio para cada defecto corregido.

La pirámide favorece tests rápidos. La cobertura es una señal, no reemplaza assertions significativas ni casos límite.

## Definition of Done

Un cambio está terminado solo si:

1. la spec y sus criterios están actualizados;
2. el diseño respeta límites de dominio y puertos/adaptadores;
3. los gates automáticos pasan;
4. tenancy, autorización, idempotencia y errores fueron evaluados;
5. observabilidad y runbook se actualizaron cuando aplica;
6. no quedan TODOs sin issue;
7. existe evidencia verificable enlazada al PR.
