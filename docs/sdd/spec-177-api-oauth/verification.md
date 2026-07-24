# Verificación — SPEC-177

## Criterios

### CAD-177-01 — `start` crea state one-time con bindings, PKCE, scopes y expiry

- [ ] `start` crea state one-time con todos los bindings requeridos.

### CAD-177-02 — `callback` consume state atómicamente y persiste tokens sólo vía secret adapter

- [ ] `callback` consume state atómicamente y persiste tokens sólo vía secret adapter.

### CAD-177-03 — `reauthorize` sólo rota la misma installation

- [ ] `reauthorize` sólo rota la misma installation.

### CAD-177-04 — Redirects y scopes respetan allowlists y mínimos aprobados

- [ ] redirects y scopes respetan allowlists/políticas mínimas.

### CAD-177-05 — `revoke` corta credenciales y jobs sin exponer tokens

- [ ] `revoke` corta credenciales y jobs sin exponer tokens.

### CAD-177-06 — La aprobación exige evidencia de replay, PKCE, reauthorize y ausencia de tokens públicos

- [ ] fixtures cubren replay, PKCE, reauthorize, revoke y ausencia de tokens públicos.
