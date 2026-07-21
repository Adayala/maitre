# Contrato RBAC — SPEC-043

OWNER/ADMIN gestionan y publican catálogos; MANAGER puede editar drafts/publicar sólo con
permisos explícitos y branch scope; roles operativos leen menú publicado necesario; GUEST
sólo accede al contrato público autorizado.

Publicar, cambiar impuestos/precios y archivar son acciones separadas y auditadas. Un actor
no publica scopes fuera de sus branches ni modifica snapshot publicado. Tests cubren matriz,
scope, self-escalation, draft leakage, endpoint público y cross-tenant.
