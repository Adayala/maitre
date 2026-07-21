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

- Elegir framework React o estrategia SSR/SPA.
- Elegir framework HTTP Node.js.
- Elegir ORM, base de datos, auth, cache, colas o almacenamiento.
- Crear microservicios anticipadamente.
- Implementar comportamiento de producto.
