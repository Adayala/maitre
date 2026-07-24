# Especificación — SPEC-121 Payroll Projection

Función pura sobre intervalos aprobados + adjustment chain + LaborPolicyVersion. Produce minutos
regulares, pausas, extras, nocturnidad y trazabilidad de motivos usando decimal y timezone IANA; no liquida
salarios ni afirma cumplimiento legal.

Resultado guarda input hash, policy version, calculation version y redondeos. Una corrección crea
nueva projection vinculada; resultados exportados permanecen inmutables y reciben delta
retroactivo. Sin policy aplicable devuelve `NOT_CONFIGURED`, no ceros ni estimación silenciosa.
