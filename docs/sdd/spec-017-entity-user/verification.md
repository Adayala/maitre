# Verificación — SPEC-017

## Criterios

### CAD-017-01 — User modela un perfil global desacoplado de credenciales y tenancy

- [ ] schema/tabla no contienen credenciales, tenant o role;
- [ ] User no embebe memberships ni branches;
- [ ] el agregado conserva semántica global y no tenant-scoped.

### CAD-017-02 — La identidad externa mapea de forma estable a un único User de dominio

- [ ] provider + external ID duplicado es rechazado;
- [ ] la identidad externa resuelve un único User;
- [ ] cambios de proveedor requieren migración explícita y no implícita.

### CAD-017-03 — Un mismo User puede participar en múltiples tenants mediante Membership

- [ ] mismo User puede tener memberships en dos tenants;
- [ ] Tenant A no obtiene datos de Membership Tenant B;
- [ ] User no se duplica por cada tenant.

### CAD-017-04 — El estado del User impacta la autenticación efectiva sin redefinir autorización

- [ ] User ACTIVE con memberships válidas obtiene contexto permitido;
- [ ] User SUSPENDED/DEACTIVATED recibe acceso denegado;
- [ ] token/subject inexistente no crea User implícitamente salvo provisioning autorizado.

### CAD-017-05 — Email y datos personales se tratan como perfil/PII minimizada

- [ ] email modificado no cambia User ID ni autorización;
- [ ] API/logs no exponen external ID o email innecesariamente;
- [ ] auditoría minimiza PII.

### CAD-017-06 — El dominio sigue portable frente a cambios del proveedor de identidad

- [ ] unit tests no dependen del vendor real;
- [ ] adapter contract prueba mapping real/fake;
- [ ] reemplazar el proveedor no altera el dominio ni los casos de uso.
