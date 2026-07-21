# VERIFICATION — SPEC-209

- [ ] `npm install` desde raíz configura todos los workspaces.
- [ ] Todos los comandos raíz funcionan en local y CI.
- [ ] Un import de infraestructura desde `domain` falla en lint.
- [ ] Un ciclo entre workspaces falla en CI.
- [ ] Un deep import no exportado falla en typecheck/build.
- [ ] Un import directo entre internals de módulos falla en `deps:check`.
- [ ] Contracts no puede importar domain/application.
- [ ] Secretos server-only no aparecen en el bundle web.
- [ ] El contrato de health genera o comparte un único tipo validado.
- [ ] Web y API se construyen independientemente.
- [ ] API se ejecuta en Vercel y en un proceso Node.js estándar.
- [ ] Tests del dominio no requieren red, Vercel ni base de datos.
- [ ] Contract tests detectan un cambio incompatible.
- [ ] Sonar analiza fuentes sin contar código generado o fixtures como cobertura útil.
- [ ] El walking skeleton respeta el presupuesto de SPEC-208.
- [ ] Los scripts raíz coinciden exactamente con SPEC-207.
