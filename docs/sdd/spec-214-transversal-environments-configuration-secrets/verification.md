# Verificación — SPEC-214

## Criterios

### CAD-214-01 — La configuración se valida por schema, falla rápido y permanece inmutable

- [ ] rechaza variable obligatoria ausente;
- [ ] rechaza URL, enum, número o relación inválidos;
- [ ] no incluye valores secretos en errores;
- [ ] config se parsea una vez y se entrega inmutable.

### CAD-214-02 — Existe separación verificable entre configuración pública y server-only

- [ ] browser schema no acepta ni expone claves server-only;
- [ ] dependency boundaries bloquean importar config server desde web;
- [ ] el bundle sólo contiene variables públicas allowlisted con `VITE_`;
- [ ] búsqueda en bundle/source maps no encuentra nombres o valores server-only.

### CAD-214-03 — Los ambientes tienen propósito, permisos y datos explícitos

- [ ] `.env.example`, inventario y schemas permanecen sincronizados;
- [ ] checkout limpio arranca con instrucciones y valores locales seguros;
- [ ] preview no puede modificar datos de demo fuera de su alcance;
- [ ] preview no contiene `DATABASE_MIGRATION_URL` ni Supabase secret/service-role key.

### CAD-214-04 — Secretos y credenciales se rotan, revocan y revisan sin editar código

- [ ] secret scanning bloquea un secreto canario;
- [ ] logs y reportes no incluyen tokens ni cadenas de conexión;
- [ ] runtime no posee permisos de migración o administración;
- [ ] rotación canaria se completa sin commit ni indisponibilidad innecesaria.

### CAD-214-05 — Despliegue, promoción y rollback son reproducibles entre plataformas

- [ ] el mismo commit funciona en preview y demo con configuración distinta;
- [ ] el target Production de Vercel reporta `APP_ENV=demo`, nunca `production`;
- [ ] configuración inválida impide readiness y no recibe tráfico;
- [ ] smoke test valida ambiente, API, identidad y base correctos;
- [ ] rollback restaura una combinación compatible de código/configuración.

### CAD-214-06 — La portabilidad se conserva al cambiar hosting o proveedor de datos/identidad

- [ ] variables propias de la integración se mapean sin alcanzar application/domain;
- [ ] existe matriz e inventario sin valores;
- [ ] existe resultado de tests y secret scan;
- [ ] existe hash del commit promovido;
- [ ] existe registro de smoke test y rollback;
- [ ] existe revisión de bundle y logs.
