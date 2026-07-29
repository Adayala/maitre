# Rules — SPEC-028

- Un item por Subscription + catalogItemCode + scopeRefId; se reactiva la identidad existente.
- Service code y config pertenecen a un catálogo/version aprobados.
- Quantity es positiva para `QUANTITY`; scopeRefId es obligatorio fuera de `TENANT`.
- `ACTIVE/INACTIVE` describe lifecycle contractual; capacidad efectiva se recalcula.
- Desactivar no borra uso/historia y una reducción incompatible queda pending remediation.
- UnitPrice captura el precio vigente al activar el ítem; la plantilla versionada vive en SPEC-228.
