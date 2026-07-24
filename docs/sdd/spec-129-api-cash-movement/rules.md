# Rules — SPEC-129

- No existen update ni delete de movimientos.
- `create` valida sesión compatible, currency coincidente y tipo permitido.
- Amount es positivo y decimal exacto.
- LimitsPolicy gobierna operaciones manuales riesgosas y puede denegar por ausencia.
- `compensate` crea entrada inversa enlazada, no reescribe el original.
