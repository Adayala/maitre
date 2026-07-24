# Verificación — SPEC-018

## Criterios

### CAD-018-01 — El catálogo posee códigos únicos en mayúsculas ASCII y una versión estable

- [ ] los códigos son únicos, ASCII y estables;
- [ ] el catálogo expone versión verificable;
- [ ] etiquetas localizadas no redefinen el código.

### CAD-018-02 — Todo código de permiso referenciado existe y un código desconocido falla cerrado

- [ ] cada código de permiso referenciado existe en catálogo;
- [ ] código desconocido falla cerrado;
- [ ] no existen referencias huérfanas.

### CAD-018-03 — OWNER no se concede mediante invitación común y ningún actor delega autoridad superior a la propia

- [ ] OWNER no se concede por invitación estándar;
- [ ] ningún actor delega autoridad superior a la propia;
- [ ] cambios protegidos requieren workflow explícito.

### CAD-018-04 — GUEST no habilita operación interna y los roles funcionales siempre respetan el alcance tenant/sucursal de Membership

- [ ] GUEST no habilita operación interna;
- [ ] roles funcionales requieren alcance válido;
- [ ] conocer el rol nominal no bypassa Membership.

### CAD-018-05 — Desactivar/deprecar un Role conserva assignments históricos y exige sucesor o migración explícita

- [ ] desactivación conserva historia;
- [ ] deprecación exige sucesor o plan de migración;
- [ ] assignments históricos siguen auditables.

### CAD-018-06 — Cambios de permisos actualizan versión, matrices y evidencia de auditoría sin CRUD tenant libre

- [ ] cambios actualizan versión y matriz;
- [ ] auditoría registra el cambio;
- [ ] no existe CRUD libre de roles por tenant en I0.
