# OBJECTIVE — SPEC-209

## Objetivo

Definir un repositorio único con límites verificables para aplicaciones React.js, APIs Node.js y código compartido, de modo que:

- las reglas de negocio se implementen una vez;
- frontend y backend compartan contratos, no infraestructura;
- cada módulo pueda probarse aisladamente;
- Vercel sea un adaptador de despliegue reemplazable;
- el build y los tests funcionen localmente y en CI gratuito;
- una futura extracción de workers o servicios no requiera reescribir el dominio.

## Fuera de alcance

- Aceptar definitivamente el toolchain antes de ADR-002/003 y SPEC-226.
- Introducir SSR, microservicios, cache, colas o realtime sin necesidad aprobada.
- Acoplar la estructura a un proveedor de base de datos, auth o hosting.
- Crear microservicios anticipadamente.
- Implementar comportamiento de producto.
