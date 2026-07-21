# Decisiones y evidencia — SPEC-226

## Estado inicial

No hay spikes ejecutados. Esta spec define el método y no constituye evidencia a favor de Supabase, Drizzle, Fastify o Vite.

La conexión del proyecto Supabase con GitHub/Vercel es un prerrequisito externo pendiente y tampoco constituye evidencia de aceptación. Mientras tanto pueden avanzar SPK-01 local y los gates locales de SPK-05.

## Fuentes a fijar al ejecutar

- documentación oficial de Vercel para runtime/límites/variables;
- documentación oficial de Supabase para Auth, pooling, RLS, backups y cuotas;
- documentación oficial de Vite, Fastify, Zod, Drizzle, Vitest, Playwright y Sonar;
- términos y pricing vigentes fechados en el registro operativo.

## Formato de resultado

```markdown
### SPK-XX — Título

- Fecha/commit:
- Resultado: PASS | FAIL | INCONCLUSIVE
- Versiones/ambiente:
- Hipótesis:
- Comandos:
- Evidencia:
- Mediciones:
- Riesgos/limitaciones:
- Recomendación ADR:
- Cleanup:
- Follow-up/owner:
```

## Decisiones posteriores

- Si ADR-002 pasa, reconciliar SPEC-017/020/023 antes de migraciones productivas.
- Si ADR-003 pasa, crear el scaffold I0 mediante SPEC-209/211/213/224.
- Si una falla, documentar alternativa y repetir únicamente criterios afectados.

## Manejo de configuración

- Registrar nombres de variables y environments, nunca valores.
- Preferir claves publishable en browser y evitar claves elevadas salvo caso server-side aprobado.
- El mapping de nombres provistos por la integración a `VITE_*`/server-only se valida durante SPK-02/03.
- Preview no ejecuta migraciones destructivas ni obtiene autoridad sobre Production.
