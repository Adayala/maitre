# Especificación — SPEC-054 ServicePeriod

Nombre normativo `ServicePeriod`, distinto de Subscription Service. Ventana operativa por Branch,
businessDate/timezone, type `BREAKFAST|LUNCH|DINNER|OTHER`, planned/actual times y lifecycle
`PLANNED -> OPEN -> CLOSING -> CLOSED`; cancel sólo PLANNED.

Unicidad/overlap se define por ServicePeriodPolicyVersion; default: no se solapan OPEN/CLOSING por
Branch. Begin-close bloquea nuevas Visits. Close espera Visits/CashSessions/Payments pending hasta
timeout; luego permanece CLOSING y escala. Force-close exige manager/reason y crea findings, pero no
marca Check/Payment como completados. Business date se deriva con timezone IANA.
