# Política de seguridad

## Reporte responsable

No abras un issue público con credenciales, datos personales o detalles explotables. Reportá la vulnerabilidad mediante **Security → Advisories → New draft security advisory** en GitHub. Incluí alcance, reproducción, impacto y una mitigación sugerida.

El equipo acusará recibo en 3 días hábiles, clasificará severidad en 7 días y coordinará divulgación después de publicar una corrección. Las credenciales expuestas se revocan inmediatamente.

## Versiones y controles

Sólo `main` recibe correcciones. CI analiza dependencias, secretos, código, permisos de workflows, tests y builds. Las excepciones temporales deben tener advisory, justificación, controles compensatorios, owner y vencimiento versionados.
