# Contrato — SPEC-017 User

## Responsabilidad

User es el perfil global de una persona conocida por Maitre. Autenticación vive en el
Identity Provider y autorización vive en Membership; User no contiene password, tokens,
tenant, roles ni alcances por sucursal.

## Campos

- `id`: UUID interno inmutable.
- `externalIdentityId`: referencia opaca única por provider, server-only cuando corresponde.
- `email`: normalizado/verificado por provider; exposición minimizada.
- `displayName`, `locale`, `timezone`: preferencias de perfil.
- `status`: `ACTIVE | SUSPENDED | DEACTIVATED`.
- `version`, timestamps y actores de auditoría.

## Invariantes

1. Una identidad externa activa mapea a lo sumo un User.
2. Email no es clave de autorización ni tenant membership.
3. Claims editables no cambian perfil/roles sin validación server-side.
4. Deshabilitar User deniega nuevos accesos en todos sus memberships y dispara revocación según SPEC-023.
5. Borrado/anonymization sigue SPEC-219/220 y preserva referencias legales/auditoría permitidas.
6. Merge de duplicados requiere workflow explícito, aliases e idempotencia.

## Aceptación

Tests cubren first login concurrente, identity mapping, email cambiado, User disabled,
provider indisponible, minimización de PII y ausencia de autorización embebida.
