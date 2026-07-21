# Verificación — SPEC-017

- [ ] Schema/tabla no contienen credenciales, tenant o role.
- [ ] Provider + external ID duplicado es rechazado.
- [ ] Email modificado no cambia User ID ni autorización.
- [ ] Token/subject inexistente no crea User implícitamente salvo provisioning autorizado.
- [ ] User ACTIVE con memberships válidas obtiene contexto permitido.
- [ ] User SUSPENDED/DEACTIVATED recibe acceso denegado.
- [ ] Mismo User puede tener memberships en dos tenants.
- [ ] Tenant A no obtiene datos de Membership Tenant B.
- [ ] API/logs no exponen external ID o email innecesariamente.
- [ ] Unit tests no usan Supabase; adapter contract prueba mapping real/fake.
