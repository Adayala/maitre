# OBJECTIVE — SPEC-211

## Objetivo

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
