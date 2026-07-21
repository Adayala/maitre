# Registro operativo de proveedores — SPEC-208

**Última verificación documental:** 2026-07-21

Este registro no confirma la configuración de las cuentas de Maitre. Distingue hechos oficiales vigentes de comprobaciones pendientes en dashboards.

## Vercel

| Campo | Estado |
| --- | --- |
| Plan candidato | Hobby |
| Costo base | USD 0 |
| Uso permitido | personal y no comercial |
| Comportamiento al alcanzar límites | el recurso/uso puede pausarse hasta reinicio de cuota; no comprar overage |
| Límite relevante para API | funciones con duración máxima configurable hasta 60 s en Hobby |
| Builds | 6.000 minutos incluidos y 100 deployments/día documentados al verificar |
| Colaboración | capacidades limitadas; validar ownership y acceso antes de depender de trabajo multi-persona |
| Uso Maitre permitido | desarrollo técnico/demo elegible, nunca piloto comercial |
| Owner/reviewer | pendiente / pendiente |
| Dashboard verificado | no |

Fuentes: [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby), [Vercel Limits](https://vercel.com/docs/limits), [Vercel Pricing](https://vercel.com/pricing).

## Supabase

| Campo | Estado |
| --- | --- |
| Plan candidato | Free |
| Costo base | USD 0 |
| Proyectos activos incluidos | 2 como máximo por owner/admin a través de organizaciones |
| Base por proyecto | 500 MB al verificar |
| Auth | 50.000 MAU al verificar |
| Egress | 5 GB + 5 GB cached al verificar |
| Storage | 1 GB al verificar |
| Backup automático | no incluido en Free |
| Inactividad | proyecto elegible para pausa después de aproximadamente 7 días de baja actividad |
| Topología inicial | un proyecto development/preview; segundo demo sólo con necesidad demostrada |
| Owner/reviewer | pendiente / pendiente |
| Dashboard/integración verificados | no; pendiente conexión del owner externo |

Fuentes: [Supabase Pricing](https://supabase.com/pricing), [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## GitHub Actions

| Campo | Estado |
| --- | --- |
| Repositorio público | runners estándar sin cargo por minutos |
| Repositorio privado GitHub Free | 2.000 minutos/mes y 500 MB de artifacts al verificar |
| Larger runners | no permitidos para el perfil USD 0 |
| Cost owner | el owner del repositorio recibe el consumo |
| Estado de visibilidad de `Adayala/maitre` | pendiente de confirmar con acceso autorizado |
| Owner/reviewer | pendiente / pendiente |

Fuente: [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## SonarQube Cloud

| Campo | Estado |
| --- | --- |
| Plan candidato | OSS |
| Elegibilidad gratuita | repositorios públicos; no proyectos privados |
| Decisión Maitre | pendiente de confirmar visibilidad/elegibilidad |
| Fallback | análisis local/CI definido por SPEC-207/224; no relaja quality gate |
| Owner/reviewer | pendiente / pendiente |

Fuente: [SonarQube Cloud subscription plans](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans).

## Capacidades todavía sin proveedor

| Capacidad | Estado | Regla inicial |
| --- | --- | --- |
| Email transaccional | no seleccionado | no enviar email real durante I0 |
| Storage de producto | Supabase candidato, no habilitado | no crear buckets hasta una spec funcional |
| Observabilidad SaaS | no seleccionado | OpenTelemetry/logs locales primero |
| Cache/rate limiting externo | no requerido | implementar sólo con evidencia |

## Checklist de revisión mensual y pre-piloto

- [ ] Abrir cada fuente oficial y actualizar fecha/cifras cambiadas.
- [ ] Verificar plan, método de pago, overage y alertas en dashboards.
- [ ] Registrar consumo actual y proyección a 50/75/90 %.
- [ ] Revisar recursos inactivos, previews y artifacts para cleanup.
- [ ] Confirmar owners/reviewers y acceso de recuperación.
- [ ] Ejecutar/exportar evidencia de backup/restore aplicable.
- [ ] Revalidar términos comerciales antes de cualquier usuario o dato real.
