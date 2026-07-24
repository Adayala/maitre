# Verificación — SPEC-226

## Criterios

### CAD-226-01 — Cada spike responde una incertidumbre concreta con evidencia ejecutable y reproducible

- [ ] otro checkout puede ejecutar comandos documentados;
- [ ] PASS incluye output, medición o test verificable;
- [ ] cada registro conserva estado `NOT_RUN` hasta que exista evidencia;
- [ ] owner y reviewer están identificados antes de ejecutar.

### CAD-226-02 — La reproducibilidad incluye comandos, versiones, configuración no secreta y cleanup explícitos

- [ ] versiones/configuración están registradas sin secretos;
- [ ] recursos temporales y cleanup están inventariados;
- [ ] el entorno de ejecución queda documentado de forma repetible.

### CAD-226-03 — Seguridad, aislamiento y secreto siguen siendo obligatorios incluso en código experimental

- [ ] tenant B y membership ausente reciben acceso denegado;
- [ ] browser/artifacts no contienen service role/connection strings;
- [ ] logs/errores no filtran tokens;
- [ ] migration y runtime credentials tienen permisos distintos;
- [ ] el registro enumera variables requeridas sin copiar sus valores.

### CAD-226-04 — Los resultados miden plataforma, presupuesto y límites reales del stack MVP

- [ ] Vite/Fastify funcionan en Vercel y local Node;
- [ ] pooling soporta concurrencia demo sin agotamiento;
- [ ] Auth/JWKS falla cerrado;
- [ ] migrations/RLS se reproducen desde Git;
- [ ] CI/toolchain cumple gates y presupuesto medido;
- [ ] dump/restore/export recupera datos sintéticos;
- [ ] cada ejecución remota registra plan/cuota y consumo inicial/final;
- [ ] no existe billing, upgrade o add-on activado por el spike;
- [ ] PASS incluye margen demo y stop conditions observables;
- [ ] límite gratuito alcanzado se reporta como resultado, no se evita comprando capacidad.

### CAD-226-05 — El código experimental tiene destino explícito y no se convierte en base productiva por inercia

- [ ] código experimental tiene destino explícito: eliminar, archivar o reescribir;
- [ ] el spike no se promueve a base productiva por default;
- [ ] la evidencia útil se separa del código descartable.

### CAD-226-06 — ADR-002 y ADR-003 sólo cambian de estado a partir de evidencia completa y honesta

- [ ] cada criterio ADR-002/003 tiene evidencia;
- [ ] inconclusive/fail no se presenta como aceptación;
- [ ] ADRs y readiness se actualizan con resultado.
