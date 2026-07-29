# Verificación — SPEC-232

- [ ] Tenant A no lee, previsualiza ni publica configuración/assets de Tenant B.
- [x] Cambiar tenant/brand/branch elimina las variables del tema anterior antes de resolver el nuevo.
- [x] Draft no afecta producción y publish sustituye la revisión efectiva.
- [x] Rollback crea una revisión nueva y conserva la historia.
- [x] MIME con firma inválida y SVG inseguro fallan con HTTP 400.
- [x] Todas las apps compilan consumiendo nombre/logo y tokens de la marca efectiva.
- [x] Assets válidos se persisten, sirven con MIME correcto y dejan de ser públicos al archivarse.
- [ ] Estados críticos y contraste permanecen accesibles bajo cualquier tema válido.
- [ ] Fallos de red/assets usan fallback sin bloquear operación.
- [ ] Cache no mezcla tenants, brands, branches, revisiones ni superficies.
