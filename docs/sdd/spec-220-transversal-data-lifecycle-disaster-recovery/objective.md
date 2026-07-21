# Objetivo — SPEC-220

Limitar la pérdida de datos y el tiempo de recuperación ante error humano, migración fallida, corrupción, borrado, incidente de seguridad o indisponibilidad de proveedor.

## Resultados esperados

- Inventario completo de activos recuperables y dependencias.
- RPO/RTO explícitos por ambiente y recorrido.
- Backups cifrados, íntegros y fuera del failure domain original.
- Restore ensayado desde documentación y herramientas versionadas.
- Retención, legal hold, anonimización y borrado coherentes.
- Migración/salida de Supabase y Vercel ejercitable.

## Fuera de alcance

- Prometer continuidad productiva usando sólo free tiers.
- Tratar Git, logs o eventos como backup de base.
- Definir plazos legales sin revisión especializada.
- Recuperar datos nunca capturados o eliminados conforme a política.
- Presentar rebuild desde Git/seed como backup de datos no regenerables.
- Retener dumps I0 en GitHub artifacts, Vercel, chat o discos personales.
