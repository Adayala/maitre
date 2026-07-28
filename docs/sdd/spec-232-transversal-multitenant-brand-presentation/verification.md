# Verificación — SPEC-232

- [ ] Tenant A no lee, previsualiza ni publica configuración/assets de Tenant B.
- [ ] Cambiar tenant/brand/branch elimina completamente el tema anterior.
- [ ] Draft no afecta producción y publish es atómico por revisión.
- [ ] Rollback preserva historia y nunca muta snapshots previos.
- [ ] Assets inválidos, SVG inseguro, fuente no permitida y template incompatible fallan cerrado.
- [ ] Todas las apps muestran nombre/logo y tokens publicados de la marca efectiva.
- [ ] Estados críticos y contraste permanecen accesibles bajo cualquier tema válido.
- [ ] Fallos de red/assets usan fallback sin bloquear operación.
- [ ] Cache no mezcla tenants, brands, branches, revisiones ni superficies.
