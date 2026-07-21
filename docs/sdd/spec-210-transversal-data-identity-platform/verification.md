# VERIFICATION — SPEC-210

- [ ] React.js no contiene secretos ni acceso directo a tablas operacionales.
- [ ] Node.js conecta desde Vercel mediante el pooler adecuado.
- [ ] Migraciones crean una base vacía reproducible.
- [ ] Un usuario del tenant A no puede leer ni modificar datos del tenant B.
- [ ] Service role no aparece en bundles, logs ni responses.
- [ ] Login, refresh, logout y revocación cumplen las specs de Identity.
- [ ] La autorización no depende solo de claims del proveedor.
- [ ] Dump y restore recuperan schema, datos, grants y RLS.
- [ ] Los objetos privados requieren signed URL válida y expirable.
- [ ] La API informa una pausa/indisponibilidad sin filtrar detalles internos.
- [ ] El adapter puede sustituirse por un fake en tests y por PostgreSQL estándar en una prueba.
- [ ] Uso proyectado se mantiene bajo 70% de las cuotas críticas de Free.
- [ ] El gate comercial está documentado y bloquea una promoción accidental.
