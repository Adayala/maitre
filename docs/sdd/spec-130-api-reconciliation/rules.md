# Rules — SPEC-130

- Cliente no envía `expected` como autoridad.
- Reconciliation aprobada no se muta por eventos tardíos.
- `reopen` es deny-by-default salvo policy aprobada explícita.
- Segregación de funciones y reasons/evidence son obligatorias cuando apliquen.
- Expected y difference usan money exacto sobre ledger revision congelada.
