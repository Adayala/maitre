# PLAN — SPEC-207

## Etapa 1 — Baseline antes del scaffolding

1. Definir monorepo, límites de paquetes y convenciones.
2. Configurar formatter, ESLint y TypeScript estricto.
3. Elegir runner de tests y estrategia por nivel.
4. Añadir validación de specs, Markdown y enlaces.
5. Configurar CI con cache y ejecución por cambios afectados.

## Etapa 2 — Quality Gate

1. Integrar SonarCloud o SonarQube según elegibilidad y costo.
2. Configurar cobertura únicamente sobre código fuente mantenible.
3. Añadir auditoría de dependencias y secret scanning.
4. Proteger `main` con checks requeridos y revisión.
5. Crear plantilla de PR trazable a specs.

## Etapa 3 — Evidencia

1. Publicar resultados de tests y cobertura.
2. Registrar excepciones técnicas como issues.
3. Medir duración, flakes y fallos escapados.
4. Revisar gates en cada milestone sin reducir estándares.
