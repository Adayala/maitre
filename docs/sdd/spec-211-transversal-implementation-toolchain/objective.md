# Objetivo — SPEC-211

Elegir un conjunto pequeño, gratuito y mantenible de herramientas que:

- implemente las specs sin acoplar dominio a frameworks;
- comparta contratos tipados entre React.js y Node.js;
- produzca un frontend estático portable;
- ejecute la API en Vercel y Node.js estándar;
- use PostgreSQL sin esconder SQL ni migraciones;
- permita tests rápidos y gates locales/CI;
- reduzca duplicación entre validación, tipos y documentación.

## Criterios

- Open source y sin licencia por desarrollador para el MVP.
- Adopción y documentación suficientes.
- TypeScript de primera clase.
- Compatibilidad con npm workspaces.
- Bajo overhead serverless.
- Salida clara a otro hosting y PostgreSQL.
- Reemplazable detrás de límites de SPEC-209.

## Fuera de alcance

- Sistema visual y librería de componentes.
- Proveedor de email, cache o jobs.
- Mobile nativo.
- Realtime y conexiones persistentes.
- Versiones exactas; se fijan en `package-lock.json` al aprobar el scaffolding.

## Criterios de aceptación

### CAD-211-01 — El toolchain es gratuito, mantenible y compatible con npm workspaces

Las herramientas seleccionadas son sostenibles para el MVP, compatibles con npm workspaces y no introducen costo por desarrollador que contradiga el perímetro aprobado.

### CAD-211-02 — Web y API comparten contratos tipados sin acoplar el dominio a frameworks

El dominio permanece agnóstico de frameworks y los contratos ejecutables se convierten en fuente tipada compartida para validación y documentación.

### CAD-211-03 — La web es portable y la API corre igual en Vercel y Node estándar

El frontend genera artefactos portables y la API usa el mismo núcleo tanto en Vercel como en un proceso Node.js estándar. El hosting no cambia la semántica del producto.

### CAD-211-04 — PostgreSQL, migraciones y RLS siguen siendo explícitos, versionados y revisables

El acceso a PostgreSQL no oculta SQL, grants ni RLS detrás de magia irreproducible. Las migraciones deben ser revisables desde Git y reproducibles en una base vacía.

### CAD-211-05 — Tests, lint y análisis de boundaries son rápidos, locales y equivalentes a CI

Unit, integration, e2e, lint, typecheck y dependency boundaries pueden correr localmente y en CI con semántica equivalente. Los fallos de contrato o arquitectura bloquean adopción.

### CAD-211-06 — ADR-003 sólo puede aceptarse con evidencia PASS de los spikes requeridos

La selección documental del toolchain no equivale a adopción final. Los resultados pendientes, fallidos o inconclusos mantienen ADR-003 en revisión.
