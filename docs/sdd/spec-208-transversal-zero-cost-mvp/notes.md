# NOTES — SPEC-208

## Principio

Free tier es una estrategia de validación, no una arquitectura permanente ni una garantía de costo futuro.

## Riesgos

- cambios de cuota o términos sin cambios en el código;
- pausas y cold starts;
- ausencia de SLA o backups;
- lock-in por combinar demasiadas APIs propietarias;
- falsa sensación de production-readiness;
- bloqueo del servicio al alcanzar límites.

## Decisiones pendientes

- PostgreSQL e identidad iniciales.
- Proveedor de email.
- Almacenamiento de objetos.
- Elegibilidad y modalidad gratuita de Sonar.
- Plataforma o presupuesto requerido para el primer piloto comercial.
