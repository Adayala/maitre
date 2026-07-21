# NOTES — SPEC-211

## Alternativas consideradas

- **Next.js:** excelente integración con Vercel, pero mezcla decisiones de renderizado y backend que el MVP no necesita todavía. Puede reevaluarse si aparece una necesidad SSR/SEO.
- **Hono:** portable y liviano; Fastify se elige por madurez en Node.js, plugins, validación y testing con inject.
- **Prisma:** buena experiencia y ecosistema; Drizzle se elige por menor capa, SQL visible y ajuste simple con Supabase serverless.
- **Redux:** no se adopta inicialmente; React y TanStack Query cubren estado local/remoto del primer MVP.
- **Jest:** Vitest reduce duplicación de configuración con Vite y ofrece cobertura compatible.

Estas elecciones son propuestas sujetas a ADR-003 y SPEC-226; las razones comparativas no equivalen a evidencia de ejecución.

## Fuentes oficiales

- [Vite: build de producción](https://vite.dev/guide/build)
- [Vite: despliegue en Vercel y otros hosts](https://vite.dev/guide/static-deploy.html)
- [Fastify serverless y Vercel](https://fastify.dev/docs/latest/Guides/Serverless/)
- [Drizzle con Supabase](https://orm.drizzle.team/docs/connect-supabase)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
- [Vitest coverage](https://vitest.dev/guide/coverage)
- [Playwright](https://playwright.dev/docs/intro)

## Pendiente para una spec de diseño UI

- tokens, tipografía, color y spacing;
- componentes accesibles;
- responsive y dispositivos objetivo;
- dark mode si aporta valor;
- librería de primitives y estrategia CSS;
- pruebas visuales y WCAG.
