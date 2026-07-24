# Contrato de dominio — SPEC-019

## Definición

Permission identifica una capacidad atómica `resource.action`; por ejemplo
`branch.read` o `membership.invite`. Roles agrupan permisos, pero la decisión final también
evalúa tenant, alcance por sucursal, estado de membership y reglas de dominio.

## Formato

- código lower-case estable: `[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*`;
- `resource`, `action`, descripción/localization key y sensibilidad;
- estado `ACTIVE | DEPRECATED` y successor cuando se retira;
- sin wildcards en assignments persistidos I0.

## Invariantes

1. Código único e inmutable; renombrar crea successor y migración.
2. El cliente nunca crea permissions ni las obtiene desde metadata editable.
3. Deny/ausencia gana ante permiso desconocido o alcance insuficiente.
4. Permiso no evita reglas de negocio, cuotas ni segregación de funciones.
5. Acciones sensibles exigen auditoría incluso cuando se autorizan.
6. Deprecación conserva historia hasta migrar todos los roles/consumidores.

## Aceptación

- Catálogo sin duplicados/wildcards ambiguos.
- Cada endpoint/command sensible referencia permission existente.
- Tests cubren permiso ausente, deprecated, alcance incorrecto y confused deputy.
- Cambios incompatibles actualizan matrices, consumidores y migración atómicamente.
