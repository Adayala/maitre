# Objetivo — SPEC-043

## Propósito

Autorizar lectura, edición, publicación y cambios sensibles de catálogo mediante permisos/alcances
explícitos, separando acceso público publicado de drafts y control editorial.

## Criterios de aceptación

### CAD-043-01 — Cada acción resuelve Membership ACTIVE, permiso y alcance de sucursal

Cada acción resuelve Membership ACTIVE, permiso y alcance de sucursal; un rol nominal no concede
“full control”.

### CAD-043-02 — Lectura publicada, lectura/escritura draft, publicación, archivado, producto, precio, impuestos y media son capacidades separadas

Lectura publicada, lectura/escritura draft, publicación, archivado, producto, precio, impuestos y
media son capacidades separadas.

### CAD-043-03 — Un actor no publica ni edita alcances fuera de sus sucursales ni modifica snapshots publicados

Un actor no publica/edita alcances fuera de sus sucursales ni modifica snapshots publicados.

### CAD-043-04 — Los roles operativos sólo consumen la lectura publicada necesaria

Los roles operativos sólo consumen la lectura publicada necesaria; no ven drafts ni datos editoriales
no requeridos.

### CAD-043-05 — El acceso público QR usa una capacidad opaca limitada

El acceso público QR usa una capacidad opaca limitada y no Membership/GUEST ni tenant/sucursal
elegido arbitrariamente.

### CAD-043-06 — Self-grant, fuga de draft, cross-tenant, revisión stale y acciones sensibles sin permiso o auditoría fallan cerrado

Self-grant, fuga de draft, cross-tenant, revisión stale y acciones sensibles sin permiso/auditoría
fallan cerrado.
