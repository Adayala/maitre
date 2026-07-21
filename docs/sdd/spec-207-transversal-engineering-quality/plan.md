# PLAN — SPEC-207

## Etapa 1 — Baseline antes del scaffolding

1. Definir monorepo, límites de paquetes y convenciones.
2. Configurar formatter, ESLint y TypeScript estricto.
3. Elegir runner de tests y estrategia por nivel.
4. Implementar los scripts raíz de `quality-gates.md`.
5. Añadir validación de specs, Markdown y enlaces.
6. Configurar CI con cache y ejecución por cambios afectados.

## Etapa 2 — Quality Gate

1. Ejecutar SPK-05 y elegir SonarQube Cloud OSS o Community Build con evidencia de costo/operación.
2. Configurar cobertura únicamente sobre código fuente mantenible.
3. Añadir auditoría de dependencias y secret scanning.
4. Proteger `main` con checks requeridos y revisión desde el primer código productivo.
5. Crear plantilla de PR trazable a specs.

## Etapa 3 — Evidencia

1. Publicar resultados de tests y cobertura.
2. Registrar excepciones técnicas como issues.
3. Medir duración, flakes y fallos escapados.
4. Revisar gates en cada milestone sin reducir estándares.
