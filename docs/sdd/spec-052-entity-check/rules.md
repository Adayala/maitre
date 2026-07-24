# Rules — SPEC-052

- I0 admite un Check por Visit; split requiere un contrato posterior.
- Todos los importes usan moneda y precisión definidas por MoneyPolicy, nunca float.
- `gross = sum(lines)` y `netDue = gross - discounts + estimatedTax + serviceCharges`.
- `paid = captures - refunds`; `balance = netDue + tipsAppliedToCheck - paid`.
- Sólo OPEN acepta nuevas líneas o ajustes ordinarios.
- PAYMENT_PENDING impide mutaciones económicas salvo workflow correctivo autorizado.
- SETTLED requiere balance cero y ningún Payment pendiente, ambiguo o en conciliación.
- VOID requiere ausencia o reversión trazable de capturas y es terminal.
- Correcciones posteriores crean ajustes/versiones auditables; no reescriben snapshots.
- Invoice toma un snapshot, pero conserva cálculo y estado fiscal independientes.
