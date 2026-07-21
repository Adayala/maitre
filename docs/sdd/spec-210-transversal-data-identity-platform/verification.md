# VERIFICATION — SPEC-210

- [ ] React.js no contiene secretos ni acceso directo a tablas operacionales.
- [ ] SPK-02 demuestra desde Vercel el pooler/modo/configuración adecuados.
- [ ] Migraciones crean una base vacía reproducible.
- [ ] Un usuario del tenant A no puede leer ni modificar datos del tenant B.
- [ ] Secret/service-role key no es requerida por runtime ni aparece en bundles, logs o responses.
- [ ] Login, refresh, logout y revocación cumplen las specs de Identity.
- [ ] La autorización no depende solo de claims del proveedor.
- [ ] Dump y restore recuperan schema, datos, grants y RLS.
- [ ] Los objetos privados requieren signed URL válida y expirable.
- [ ] La API informa una pausa/indisponibilidad sin filtrar detalles internos.
- [ ] El adapter puede sustituirse por un fake en tests y por PostgreSQL estándar en una prueba.
- [ ] Uso proyectado se mantiene bajo 70% de las cuotas críticas de Free.
- [ ] El gate comercial está documentado y bloquea una promoción accidental.
- [ ] Preview carece de credenciales y workflow de migración compartida.
- [ ] El segundo proyecto Supabase no existe sin necesidad aprobada.
- [ ] ADR-002 permanece PROPOSED mientras algún spike requerido esté `NOT_RUN`, FAIL o INCONCLUSIVE.
