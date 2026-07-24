# Rules — SPEC-126

- `expected` se calcula siempre desde la ledger revision congelada.
- Sólo CashSession `CLOSED` puede entrar en reconciliación.
- `APPROVED` no se muta por eventos tardíos; se usan revisiones o ajustes posteriores explícitos.
- Preparer y approver deben diferir cuando la policy lo exija.
- Resubmit tras rechazo crea nueva revisión, no sobrescribe el intento previo.
