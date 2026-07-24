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

## Criterios de aceptación

### CAD-220-01 — Existe inventario completo de activos recuperables, dependencias y objetivos RPO/RTO por ambiente

La recuperación se diseña desde un inventario explícito de activos y dependencias. RPO y RTO se expresan por ambiente y recorrido, no como declaración genérica.

### CAD-220-02 — Un backup sólo es válido si puede restaurarse de forma verificable fuera del failure domain original

Los backups, dumps y exports deben cifrarse, identificarse y probarse mediante restores verificables. Sin restore probado, no existe backup confiable.

### CAD-220-03 — PostgreSQL, identidad, objetos, configuración y secretos se recuperan por procedimientos coordinados pero separados

La recuperación distingue dominios técnicos con runbooks específicos y coordinación explícita. Recuperar datos no implica ampliar permisos ni mezclar credenciales inseguras.

### CAD-220-04 — Retención, legal hold, borrado y anonimización siguen categorías y obligaciones explícitas

La lifecycle de datos se define por categoría y obligación, no por una duración universal. Restore y export deben respetar tombstones, holds y restricciones de borrado.

### CAD-220-05 — La portabilidad y salida de proveedor son ejercitables antes de guardar datos no regenerables

Dump, exportación y restauración fuera del proveedor origen deben demostrar que el sistema puede salir del stack actual con datos sintéticos y evidencia reproducible.

### CAD-220-06 — El perímetro MVP bloquea continuidad o retención impropias mientras no exista plataforma aprobada

Mientras el MVP siga sobre free tier y datos sintéticos, no se promete continuidad productiva ni se retienen dumps fuera de policy. La aparición de datos no regenerables activa gates adicionales.
