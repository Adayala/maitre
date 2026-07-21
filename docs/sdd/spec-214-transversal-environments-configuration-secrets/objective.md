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
