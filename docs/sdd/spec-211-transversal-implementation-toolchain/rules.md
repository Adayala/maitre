# RULES — SPEC-211

1. Vite produce un build web estático; no se introduce SSR sin una spec.
2. Fastify es adapter HTTP, no contenedor del dominio.
3. Zod valida fronteras; las invariantes viven en dominio.
4. OpenAPI se genera, no se mantiene manualmente en paralelo.
5. React Query maneja estado remoto; no duplicarlo en stores globales.
6. No añadir Redux u otro store hasta demostrar un caso que React/local/query state no resuelva bien.
7. Drizzle vive en persistence adapters y no filtra sus tipos al dominio.
8. `drizzle-kit push` solo puede utilizarse en una base local desechable.
9. Toda migración SQL se revisa y prueba desde cero.
10. Supavisor transaction mode requiere `prepare: false`.
11. Tests unitarios no hacen red, filesystem persistente ni DB.
12. E2E cubre recorridos, no reemplaza tests de dominio o integración.
13. No usar snapshots grandes como sustituto de assertions semánticas.
14. ESLint y Sonar no pueden silenciarse globalmente para aprobar un cambio.
15. Cada disable requiere motivo local; los de seguridad/calidad crítica requieren issue.
16. El lockfile se versiona y `npm ci` es obligatorio en CI.
17. No se incorpora una dependencia que duplique una capacidad ya cubierta sin ADR.
