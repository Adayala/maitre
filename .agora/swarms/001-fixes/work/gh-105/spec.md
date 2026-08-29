# Spec: ruta contextual para detalles de salón

## Decisión

El panel de salón mostrará siempre la ruta `Marca: <nombre> · Sucursal: <nombre>`. Los nombres provienen de las colecciones tenant-scoped ya autorizadas; no se infieren globalmente ni se hardcodean valores de una marca.

La función de presentación acepta etiquetas configurables, manteniendo los defaults localizados actuales. No se muestran marcas o sucursales ausentes de las consultas del tenant activo.

## Unidades y branches

- Ruta con etiquetas por defecto.
- Ruta con etiquetas configuradas por una marca/tenant.
- Estado de carga cuando todavía no se resolvió la ruta.
- Salones homónimos en sucursales o marcas distintas producen rutas diferentes.

## Playwright

Dash verificará la ruta completa al mostrar el salón, incluida la navegación desde otra rama, persistencia y accesibilidad.
