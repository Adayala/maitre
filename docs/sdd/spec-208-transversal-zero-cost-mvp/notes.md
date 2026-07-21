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

## Verificación 2026-07-21

- Vercel Hobby se documenta como personal/no comercial y pausa el uso al superar límites incluidos; no se usa como base de un piloto comercial.
- Supabase Free permite hasta dos proyectos activos, carece de backups automáticos y puede pausar proyectos por inactividad aproximada de una semana.
- GitHub Actions es gratuito en runners estándar para repositorios públicos; repositorios privados dependen de la cuota del plan propietario.
- SonarQube Cloud OSS gratuito admite repositorios públicos, no privados.

Las cifras detalladas y fuentes están en `provider-register.md`; se revisan antes de ejecutar SPK-05 y antes de cada piloto.
