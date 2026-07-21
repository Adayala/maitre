# Decisiones y evidencia — SPEC-226

## Estado inicial

No hay spikes ejecutados. Esta spec define el método y no constituye evidencia a favor de Supabase, Drizzle, Fastify o Vite.

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
