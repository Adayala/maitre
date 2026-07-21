# NOTES — SPEC-207

## Decisiones

- La calidad se mide sobre código nuevo para no incentivar cambios cosméticos en código histórico.
- DRY no significa centralizar prematuramente; una duplicación puede ser preferible hasta comprender el concepto común.
- Sonar complementa lint, tipos, tests y revisión humana; no los reemplaza.
- Los gates deben ser ejecutables localmente para evitar dependencia exclusiva del proveedor CI.

## Preguntas abiertas

- Elegibilidad del repositorio para SonarCloud gratuito.
- Runner y librerías exactas de tests.
- Política inicial de licencias permitidas.
- Número de aprobaciones requerido en `main`.
