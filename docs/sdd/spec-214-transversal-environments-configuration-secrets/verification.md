# Verificación — SPEC-214

## Tests de configuración

- Rechaza variable obligatoria ausente.
- Rechaza URL, enum, número o relación inválidos.
- No incluye valores secretos en errores.
- Browser schema no acepta ni expone claves server-only.
- Config se parsea una vez y se entrega inmutable.
- `.env.example`, inventario y schemas permanecen sincronizados.
- Variables propias de la integración se mapean sin alcanzar application/domain.

## Gates de seguridad

- [ ] Secret scanning bloquea un secreto canario.
- [ ] Dependency boundaries bloquean importar config server desde web.
- [ ] Búsqueda en bundle/source maps no encuentra nombres o valores server-only.
- [ ] Logs y reportes no incluyen tokens ni cadenas de conexión.
- [ ] Preview no puede modificar datos de demo fuera de su alcance.
- [ ] Runtime no posee permisos de migración o administración.
- [ ] Preview no contiene `DATABASE_MIGRATION_URL` ni Supabase secret/service-role key.
- [ ] El bundle sólo contiene variables públicas allowlisted con `VITE_`.

## Gates operativos

- [ ] Checkout limpio arranca con instrucciones y valores locales seguros.
- [ ] El mismo commit funciona en preview y demo con configuración distinta.
- [ ] El target Production de Vercel reporta `APP_ENV=demo`, nunca `production`.
- [ ] Configuración inválida impide readiness y no recibe tráfico.
- [ ] Smoke test valida ambiente, API, identidad y base correctos.
- [ ] Rollback restaura una combinación compatible de código/configuración.
- [ ] Rotación canaria se completa sin commit ni indisponibilidad innecesaria.

## Evidencia

- Matriz e inventario sin valores.
- Resultado de tests y secret scan.
- Hash del commit promovido.
- Registro de smoke test y rollback.
- Revisión de bundle y logs.
