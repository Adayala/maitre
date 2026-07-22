# Especificación — SPEC-064 CheckOpened / CheckSettled

`floor.check.opened.v1` representa creación de Check; `floor.check.settled.v1`, balance cero y estado
SETTLED. `CheckGenerated` queda nombre legado no publicable.

Envelope + check/visit/branch, currency, totals permitidos, revision y timestamp. No implica Invoice
ni autorización fiscal. Ajustes posteriores autorizados usan evento/revision explícito.
