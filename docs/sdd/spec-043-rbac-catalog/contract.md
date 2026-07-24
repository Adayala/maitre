# Contrato RBAC — SPEC-043

OWNER/ADMIN gestionan y publican catálogos; MANAGER puede editar drafts/publicar sólo con
permisos explícitos y alcance por sucursal; roles operativos leen menú publicado necesario; GUEST
sólo accede al contrato público autorizado.

Publicar, cambiar impuestos/precios y archivar son acciones separadas y auditadas. Un actor
no publica alcances fuera de sus sucursales ni modifica snapshot publicado. Tests cubren matriz,
alcance, self-escalation, draft leakage, endpoint público y cross-tenant.
