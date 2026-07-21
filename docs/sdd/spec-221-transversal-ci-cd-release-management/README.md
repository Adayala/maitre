# [SPEC-221] CI/CD & Release Management

Contrato transversal para integrar, verificar, desplegar, promover y revertir cambios de Maitre de manera reproducible y auditable.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-221 |
| **Tipo** | Transversal / Delivery Engineering |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Blockers** | Configuración de plataforma no verificada |
| **Prioridad** | P0 |
| **Fase** | Antes de automatizar el primer deployment |
| **Depende de** | SPEC-207–220 |

## Decisiones centrales

- Desarrollo trunk-based con ramas cortas y `main` protegida.
- Conventional Commits para historial y automatización.
- Preview por pull request, development desde `main` y demo mediante promoción aprobada.
- El mismo commit/artefacto se promueve; no se reconstruye código diferente por ambiente.
- Migraciones expand/migrate/contract y forward-only durante el MVP.
- Rollback de aplicación separado de recuperación/compensación de datos.
- Production permanece deshabilitado hasta cumplir gates comerciales, operativos y de seguridad.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Contrato de delivery I0](i0-delivery-contract.md)

I0 usa Preview por PR y un deployment Production staged con `APP_ENV=demo`. No existe destino de producción comercial ni deployment remoto `development` separado.
