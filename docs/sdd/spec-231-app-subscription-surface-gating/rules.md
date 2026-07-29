# Rules — SPEC-231

- Ocultar navegación no sustituye enforcement backend ni RBAC.
- Las cantidades se muestran como capacidad contratada, no como consumo.
- Un servicio tenant aplica a todas las sucursales; uno branch sólo a su scopeRefId.
- Refrescar access invalida la visibilidad después de una alta, baja o cambio de cantidad.
- Los estados sin servicio no revelan precios ni permiten mutaciones comerciales.
