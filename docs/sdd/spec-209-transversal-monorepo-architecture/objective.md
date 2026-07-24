# Objetivo — SPEC-209

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

## Criterios de aceptación

### CAD-209-01 — El monorepo separa aplicaciones, contratos y núcleo con boundaries verificables

La estructura distingue claramente apps, packages compartidos y núcleo de dominio/aplicación. Los límites se verifican por tooling y no dependen sólo de disciplina manual.

### CAD-209-02 — Dominio y contratos permanecen desacoplados de infraestructura y hosting

El dominio no importa infraestructura y los contratos no dependen de implementación concreta. Vercel es un adaptador reemplazable y no una condición arquitectónica.

### CAD-209-03 — Instalación, build y tests son reproducibles desde la raíz

Los workspaces se resuelven desde la raíz y los comandos compartidos corren igual en local y CI. Web y API se construyen de forma independiente sin acoplamiento accidental.

### CAD-209-04 — Ciclos, deep imports y accesos a internals se bloquean automáticamente

Los límites de dependencias se controlan por herramientas automáticas. Cualquier ciclo o import prohibido rompe el gate correspondiente.

### CAD-209-05 — El frontend no expone secretos y los contratos compartidos detectan incompatibilidades

Los bundles web no contienen secretos server-only y los contratos tipados compartidos detectan drift o incompatibilidades. Los tests contractuales actúan como guardia de compatibilidad.

### CAD-209-06 — La estructura conserva portabilidad y permite extracciones futuras sin reescribir el dominio

La arquitectura permite futuras separaciones de workers o servicios manteniendo el dominio estable. El layout inicial prepara esa salida sin convertirla en microservicios prematuros.
