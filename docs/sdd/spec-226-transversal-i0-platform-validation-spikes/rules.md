# Reglas — SPEC-226

## Invariantes

1. Un spike prueba una hipótesis y tiene límite de alcance/tiempo.
2. No usa datos o credenciales reales.
3. No implementa comportamiento productivo ni autoriza una spec funcional.
4. PASS requiere evidencia reproducible; inconclusive no cuenta como PASS.
5. Criterios P0 fallidos bloquean aceptación de ADR.
6. Código experimental no se copia a producción sin review/rewrite.
7. Recursos del spike tienen owner y cleanup.
8. Mediciones incluyen versiones y ambiente.
9. Secrets no aparecen en commit, logs o artifacts.
10. Alternativas se comparan con criterios equivalentes.
11. Todo resultado comienza `NOT_RUN`; no se infiere PASS por configuración o documentación.
12. Evidencia contiene nombres de variables y valores redactados, nunca secrets.
13. La ausencia de un recurso remoto bloquea sólo los experimentos que realmente lo requieren.

## Timebox propuesto

- SPK-01/02/03/04: máximo un día de trabajo enfocado cada uno.
- SPK-05/06: máximo medio día cada uno.
- Un spike que excede el timebox se detiene y registra por qué; no expande scope silenciosamente.
