# SPECIFICATION — SPEC-208

## Presupuesto

- Objetivo mensual durante desarrollo/demo: **USD 0**.
- No se habilita consumo on-demand ni auto-upgrade sin decisión explícita.
- Un límite alcanzado degrada o pausa una capacidad; nunca genera gasto no aprobado.

## Perfil inicial

| Capacidad | Perfil | Restricción contractual |
| --- | --- | --- |
| Web y APIs | React.js + Node.js en Vercel free tier | Solo mientras el uso sea elegible para el plan gratuito vigente |
| Datos | PostgreSQL free tier reemplazable | Cuota, backup y recuperación documentados |
| Identidad | Free tier o implementación portable | Exportación de usuarios y revocación disponibles |
| Email | Proveedor free tier | Cupo diario y mensual controlado |
| Objetos | Free tier | Tamaño, tipo y retención limitados |
| Cache/rate limit | No requerido inicialmente | Se añade solo con una spec que lo necesite |
| CI | GitHub Actions dentro de cuota gratuita | Workflows eficientes y sin runners premium |
| Calidad | Sonar gratuito si el repositorio es elegible | Fallback local/documentado sin relajar gates |

Los proveedores concretos, cuotas y fecha de verificación se mantienen en un registro operativo versionado porque pueden cambiar sin modificar el comportamiento del producto.

## Guardrails

- dashboard de uso por proveedor revisado semanalmente;
- alertas disponibles configuradas al 50%, 75% y 90%;
- límites funcionales por tenant y ambiente;
- datos de demo con retención y limpieza;
- previews efímeras y recursos eliminables;
- archivos optimizados y tamaños máximos;
- jobs y emails con cuotas internas inferiores al proveedor;
- inventario de recursos free tier, dueño y fecha de expiración/inactividad.

## Límite comercial

El free tier de Vercel Hobby documentado para uso personal/no comercial no debe utilizarse para cobrar, operar un cliente real o incumplir sus términos. Antes de un piloto comercial se debe aprobar una de estas salidas:

1. presupuesto para el plan comercial aplicable;
2. migración a una plataforma cuyo plan permita el uso previsto;
3. redefinición del piloto para mantenerlo dentro de los términos vigentes.

## Criterios de migración

- cambio de términos o eliminación del free tier;
- uso proyectado >= 70% de una cuota crítica durante dos períodos;
- pausa por inactividad incompatible con el piloto;
- ausencia de backup/restore suficiente;
- necesidad de SLA, soporte, seguridad o cumplimiento no incluido;
- comienzo de uso comercial;
- costo operativo humano mayor que el ahorro.
