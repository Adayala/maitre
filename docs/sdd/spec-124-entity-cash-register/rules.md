# Rules — SPEC-124

- CashRegister configura la caja; no guarda saldo corriente ni apertura concreta.
- Sólo una CashSession `OPEN|CLOSING` por register/currency.
- Money usa precisión exacta; business date y timezone quedan congelados por sesión.
- `CLOSED` no se reabre; eventos tardíos crean LateAdjustment enlazado.
- `RECONCILED` requiere validación posterior, no sólo cierre operativo.
