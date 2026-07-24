# Objetivo — SPEC-214

Eliminar configuración implícita y diferencias manuales entre ambientes, reduciendo filtraciones de secretos, despliegues irreproducibles y lock-in de plataforma.

## Resultados esperados

- Arranque fail-fast ante configuración ausente o inválida.
- Separación verificable entre configuración pública y server-only.
- Ambientes con propósito, datos y permisos explícitos.
- Rotación y revocación de secretos con responsables definidos.
- Promoción y rollback sin editar código ni dashboards de forma irreproducible.
- Migración de Vercel o Supabase mediante el reemplazo de adaptadores y valores, no del dominio.

## Fuera de alcance

- Seleccionar un gestor de secretos pago.
- Crear un ambiente productivo antes del piloto aprobado.
- Guardar secretos reales como documentación o fixtures.
- Duplicar en esta spec las políticas internas de cada proveedor.

## Criterios de aceptación

### CAD-214-01 — La configuración se valida por schema, falla rápido y permanece inmutable

Cada ambiente arranca sólo con configuración válida, parseada una vez y entregada de forma inmutable. Los errores de configuración no exponen secretos ni continúan con defaults implícitos peligrosos.

### CAD-214-02 — Existe separación verificable entre configuración pública y server-only

Las variables públicas y server-only se diferencian por contrato y tooling. El frontend no puede importar ni exponer configuración privilegiada.

### CAD-214-03 — Los ambientes tienen propósito, permisos y datos explícitos

Local, CI, preview y demo poseen alcance definido, permisos mínimos y datos compatibles con su propósito. Ningún ambiente comparte credenciales o workflows privilegiados sin aprobación.

### CAD-214-04 — Secretos y credenciales se rotan, revocan y revisan sin editar código

La gestión de secretos permite rotación, rollback y revocación operativa sin commits con valores reales. Runtime, migración y administración usan credenciales diferenciadas cuando aplique.

### CAD-214-05 — Despliegue, promoción y rollback son reproducibles entre plataformas

El mismo commit puede promoverse entre ambientes con distinta configuración sin editar código ni dashboards manuales irreproducibles. Los smoke tests y runbooks validan el target correcto.

### CAD-214-06 — La portabilidad se conserva al cambiar hosting o proveedor de datos/identidad

La configuración expresa nombres y schemas portables. Vercel y Supabase son inyectores de valores, no autoridad lógica del dominio o de sus contratos.
