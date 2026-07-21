# Contrato de reglas — SPEC-123 Labor Compliance

Evaluar jornadas y planificación contra políticas versionadas por jurisdicción y tenant,
generando findings explicables de severidad INFO/WARNING/BLOCKING. Las reglas nunca borran
evidencia, distinguen fecha de ocurrencia y vigencia normativa, y requieren revisión humana
para decisiones laborales. Tests cubren descansos, máximos diarios/semanales, menores cuando
aplique, DST, cambios retroactivos, excepciones documentadas y comportamiento sin configuración.
