# Especificación — SPEC-043 Catalog RBAC

Permissions canónicas:

```text
catalog.read_published
catalog_draft.read
catalog_draft.write
catalog_menu.publish
catalog_menu.archive
catalog_product.write
catalog_price.write
catalog_tax.assign
catalog_availability.configure
catalog_media.manage
catalog_audit.read
```

OWNER/ADMIN/MANAGER reciben assignments y alcances por sucursal versionados; no se autoriza por jerarquía ni
por rol `EMPLOYEE`. Roles operativos obtienen sólo `read_published`; GUEST usa capability pública de
QR Menu, no Membership.

Publish, price, tax, archive y media son permisos separados. Un actor no publica alcances fuera de sus
sucursales ni ve drafts por poseer lectura pública. Toda acción sensible usa expected revision/audit.
