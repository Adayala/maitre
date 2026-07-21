# Reglas — SPEC-221

## Invariantes

1. Ningún release carece de commit/SHA, specs y evidencia de gates.
2. El mismo código probado se promueve entre ambientes.
3. `main` no acepta un cambio con checks obligatorios fallidos o ausentes.
4. Preview nunca recibe datos o secretos productivos.
5. Aplicación no ejecuta migraciones en cold starts.
6. Migraciones mantienen compatibilidad durante la ventana de rollback.
7. Rollback de código no se presenta como rollback de datos/efectos externos.
8. Feature flags no reemplazan autorización y poseen fecha de retiro.
9. Releases de emergencia conservan controles críticos y revisión posterior.
10. Production permanece bloqueado hasta cumplir seguridad, DR, operación y términos comerciales.
11. Artefactos no contienen secretos ni dumps.
12. Optimizar cuota no puede volver silenciosamente opcional un gate.
13. I0 promueve un staged Production build; Preview-to-Production rebuild no es promoción de artefacto idéntico.
14. `APP_ENV=demo` es obligatorio en el target Production de Vercel.
15. Preview no recibe migration/admin credentials ni ejecuta schema changes.
16. El check agregador requerido siempre reporta estado, incluso en cambios docs-only.
17. Workflows de forks/untrusted PRs nunca acceden a secrets.
18. Restricciones Hobby de commit author/owner se verifican antes de prometer colaboración o deploy automático.

## Excepciones

Toda excepción indica gate omitido, riesgo, compensación, aprobador, vigencia y tarea de cierre. Una excepción vencida bloquea la siguiente promoción.
