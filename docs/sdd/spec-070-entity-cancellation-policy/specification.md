# Especificación — SPEC-070 CancellationPolicy

Policy versionada por sucursal/canal con effective interval, windows, classification, reason codes y
consecuencias informativas. Reservation congela policy version al confirmar.

Evaluate es pura con `asOf` UTC + timezone. Override no muta policy: crea CancellationOverride con
permission `reservation.policy.override`, actor, reason allowlisted, alcance, expiry, evidence y
approval si supera límite. I0 nunca cobra penalidad automáticamente.
