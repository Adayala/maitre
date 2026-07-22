# Especificación — SPEC-186 Integrations RBAC

Permisos: `integration.read/configure/activate/disable`, `oauth.authorize/revoke`,
`credential.rotate`, `sync.run/retry`, `webhook.outbound.manage`, `webhook.inbound.manage`,
`integration.test`, `integration.audit.read`.

`operator`, `integration admin` y `tenant admin` no son roles locales; roles canónicos reciben
assignments. Secrets no son legibles por ningún permiso. OAuth/rotation/outbound endpoint changes
requieren step-up y, según policy, segregación. Revocation pausa sesiones/jobs activas.
