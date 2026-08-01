# Decisiones y evidencia — SPEC-226

## Estado inicial

Los workflows Quality/E2E y los deployments Vercel se ejecutan remotamente desde `main`. Esta
evidencia confirma conectividad operativa del delivery, pero no completa por sí sola los criterios
SPK-01–06 ni constituye aceptación integral de Supabase, Drizzle, Fastify o Vite.

La evidencia de ambientes Supabase, pooling, Auth, RLS, restore y cuotas sigue pendiente. Pueden
avanzar los criterios locales y remotos que no dependan de esos accesos.

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

## Presupuesto

- Los spikes validan la viabilidad dentro del free tier; no justifican gasto automático.
- Cualquier pantalla que solicite billing o upgrade detiene la ejecución y se registra como evidencia.
- Pricing y límites son datos temporales: se fijan con fecha y fuente oficial al ejecutar, no se copian como constantes normativas en esta spec.
