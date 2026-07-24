# Verificación — SPEC-209

## Criterios

### CAD-209-01 — El monorepo separa aplicaciones, contratos y núcleo con boundaries verificables

- [ ] `npm install` desde raíz configura todos los workspaces;
- [ ] un deep import no exportado falla en typecheck/build;
- [ ] un import directo entre internals de módulos falla en `deps:check`.

### CAD-209-02 — Dominio y contratos permanecen desacoplados de infraestructura y hosting

- [ ] un import de infraestructura desde `domain` falla en lint;
- [ ] contracts no puede importar domain/application;
- [ ] API se ejecuta en Vercel y en un proceso Node.js estándar.

### CAD-209-03 — Instalación, build y tests son reproducibles desde la raíz

- [ ] todos los comandos raíz funcionan en local y CI;
- [ ] web y API se construyen independientemente;
- [ ] tests del dominio no requieren red, Vercel ni base de datos.

### CAD-209-04 — Ciclos, deep imports y accesos a internals se bloquean automáticamente

- [ ] un ciclo entre workspaces falla en CI;
- [ ] las reglas de dependencias fallan de manera determinista;
- [ ] local y CI comparten la misma semántica de validación.

### CAD-209-05 — El frontend no expone secretos y los contratos compartidos detectan incompatibilidades

- [ ] secretos server-only no aparecen en el bundle web;
- [ ] el contrato de health genera o comparte un único tipo validado;
- [ ] contract tests detectan un cambio incompatible.

### CAD-209-06 — La estructura conserva portabilidad y permite extracciones futuras sin reescribir el dominio

- [ ] Sonar analiza fuentes sin contar código generado o fixtures como cobertura útil;
- [ ] el walking skeleton respeta el presupuesto de SPEC-208;
- [ ] los scripts raíz coinciden exactamente con SPEC-207.
