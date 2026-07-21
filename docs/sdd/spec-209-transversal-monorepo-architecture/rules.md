# RULES — SPEC-209

1. `modules/*/domain` no importa React, Node HTTP, Vercel, ORM, contracts ni SDKs.
2. `modules/*/application` depende de su domain e interfaces propias, nunca de adapters.
3. `apps/web` no importa adapters ni código server-only.
4. `apps/api` no contiene reglas de negocio en handlers.
5. Los DTOs externos no se reutilizan como entidades de dominio.
6. Cada workspace tiene responsabilidad, API pública y owner claros.
7. No se crea un paquete `shared` genérico; el nombre debe expresar el concepto compartido.
8. DRY se aplica a conocimiento estable, no a código accidentalmente parecido.
9. Los imports internos usan exports públicos; se prohíben deep imports no declarados.
10. Los ciclos de dependencias bloquean CI.
11. Cada nueva dependencia se instala en el workspace que la utiliza.
12. Los scripts no dependen de Vercel para ejecutar localmente.
13. Secretos y configuración server-only no pueden entrar al bundle web.
14. Fixtures no contienen PII, credenciales ni datos fiscales reales.
15. Una excepción arquitectónica requiere ADR e issue con fecha de revisión.
16. Un módulo no hace deep import de otro; usa API pública, port o evento.
17. Se prohíben paquetes genéricos `domain`, `application`, `common` y `shared` en la raíz.
18. Contracts de transporte no se reutilizan como entities ni importan módulos.
19. La lista de scripts raíz coincide con SPEC-207 y no crea aliases rivales.
