# Structure — SPEC-048

Tech stack:
- Frontend: React.js + TypeScript
- Hosting inicial: Vercel
- Build/framework: decisión de implementación separada; debe producir un build ejecutable fuera de Vercel
- Package: npm
- API: REST (Bearer token)

Features:
- SPA routing
- Protected routes (auth)
- State management (React Context or Redux)
- Real-time updates (polling)

Portability:
- No direct database access from the browser
- No Vercel SDK imports in UI or domain code
- API base URL and runtime configuration injected per environment
- Build and tests runnable outside Vercel
