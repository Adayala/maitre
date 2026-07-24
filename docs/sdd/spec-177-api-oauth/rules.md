# Reglas — SPEC-177

- `start` crea state one-time con bindings completos.
- `callback` consume state atómicamente y persiste secretos sólo vía adapter.
- `reauthorize` no puede sustituir otra installation.
- Redirects son allowlisted y scopes mínimos.
- Browser/logs nunca reciben tokens persistentes.
