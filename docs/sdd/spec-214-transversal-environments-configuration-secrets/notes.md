# Decisiones — SPEC-214

## Decisiones

- Zod, ya adoptado en SPEC-211, valida también configuración para evitar otra representación y dependencia.
- No se incorpora un gestor de secretos adicional durante el MVP: se usan capacidades de Vercel, Supabase, GitHub y archivos locales ignorados, bajo un contrato portable.
- `.env.example` documenta forma, nunca valores utilizables.
- Los flags iniciales son configuración tipada; un servicio dedicado sólo se justifica por segmentación o operación dinámica medida.
- Production es un ambiente reservado, no un alias de demo.
- En Vercel Hobby, `demo` puede desplegarse en el target denominado Production manteniendo `APP_ENV=demo`; la distinción es contractual y visible.
- `DATABASE_URL` es pooled/runtime y `DATABASE_MIGRATION_URL` es directa/administrativa; SPK-02 valida los endpoints concretos.
- Se prefieren publishable keys actuales para browser. Las legacy `anon` sólo son fallback de compatibilidad durante validación.
- No se agrega una Supabase secret/service-role key hasta que una spec server-side demuestre su necesidad.

## Convención de nombres

- nombres por capacidad, no por proveedor cuando el contrato sea genérico;
- sufijos explícitos para URL, ID, token, key o timeout;
- unidades en el nombre, por ejemplo `_TIMEOUT_MS`;
- variables públicas con `VITE_` únicamente cuando deben entrar al navegador;
- evitar nombres ambiguos como `SECRET`, `URL` o `KEY` sin contexto.

## Preguntas abiertas antes del piloto

- Gestor de secretos y roles requerido para operación multi-persona.
- Política formal de rotación según criticidad.
- Separación de cuentas y organizaciones de proveedores.
- Evidencia de auditoría y retención requerida.
- Procedimiento de break-glass y custodia de certificados ARCA.
