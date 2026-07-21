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

La fuente actual es [provider-register.md](provider-register.md). Una cifra vencida o no verificada se trata como desconocida, no como capacidad disponible.

## Guardrails

- dashboard de uso por proveedor revisado semanalmente;
- alertas disponibles configuradas al 50%, 75% y 90%;
- límites funcionales por tenant y ambiente;
- datos de demo con retención y limpieza;
- previews efímeras y recursos eliminables;
- archivos optimizados y tamaños máximos;
- jobs y emails con cuotas internas inferiores al proveedor;
- inventario de recursos free tier, dueño y fecha de expiración/inactividad.

Cuando el proveedor no ofrezca alertas configurables en el plan gratuito, el control se implementa mediante revisión manual versionada y límites internos. Los porcentajes 50/75/90 se calculan sobre la cuota oficial vigente y nunca reemplazan el hard limit del proveedor.

## Topología inicial de costo cero

```text
Vercel Hobby
  ├── Preview: branches/PRs autorizados
  └── Production target: demo sintética (`APP_ENV=demo`)

Supabase Free project 1
  └── development + previews con tenants sintéticos aislados y cleanup

Supabase Free project 2
  └── demo estable, sólo cuando el walking skeleton lo requiera
```

No se crea el segundo proyecto “por si acaso”. Antes se demuestra la necesidad de separar demo. Previews no ejecutan migraciones contra recursos compartidos; un pipeline controlado aplica cambios compatibles.

## Límite comercial

El free tier de Vercel Hobby documentado para uso personal/no comercial no debe utilizarse para cobrar, operar un cliente real o incumplir sus términos. Antes de un piloto comercial se debe aprobar una de estas salidas:

1. presupuesto para el plan comercial aplicable;
2. migración a una plataforma cuyo plan permita el uso previsto;
3. redefinición del piloto para mantenerlo dentro de los términos vigentes.

Una demo interna orientada a desarrollar un negocio no se presume automáticamente elegible. El owner debe confirmar el uso frente a los términos vigentes; ante duda, el deployment queda local o se elige una plataforma/plan autorizado.

## Respuesta ante cuotas

| Nivel interno | Acción mínima |
| ---: | --- |
| 50 % | registrar tendencia y confirmar medición |
| 75 % | congelar expansión de consumo y preparar cleanup/migración |
| 90 % | detener tareas no esenciales y ejecutar runbook de capacidad |
| límite | degradar/pausar de forma visible; no habilitar pago automáticamente |

Auth y autorización deben seguir fallando cerrado. Nunca se relaja RLS, validación o aislamiento para reducir consumo.

## Criterios de migración

- cambio de términos o eliminación del free tier;
- uso proyectado >= 70% de una cuota crítica durante dos períodos;
- pausa por inactividad incompatible con el piloto;
- ausencia de backup/restore suficiente;
- necesidad de SLA, soporte, seguridad o cumplimiento no incluido;
- comienzo de uso comercial;
- costo operativo humano mayor que el ahorro.
