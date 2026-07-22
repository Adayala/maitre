# Especificación — SPEC-134 DailySettlement

Función pura por tenant, branch, business date/timezone, currency y ledger revision. Separa cash
journal de medios no-cash y reconcilia source identities con Payment para detectar faltantes o
duplicados.

Por sesión aplica la ecuación SPEC-126; por día suma openings, movements por type, expected,
counted, differences y late adjustments sin netear monedas. Resultado conserva input hash,
cutoffs, revisions y reason trace. Recalcular genera nueva versión; no muta un settlement cerrado.
