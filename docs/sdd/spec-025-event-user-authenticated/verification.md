# Verificación — SPEC-025

## Criterios

### CAD-025-01 — Una autenticación exitosa observada produce `identity.user.authenticated.v1`; Maitre no requiere `POST /auth/login` propio

- [ ] autenticación exitosa observada produce una intención lógica;
- [ ] el evento no se emite desde un endpoint Maitre inexistente;
- [ ] el flujo sigue dependiendo del proveedor.

### CAD-025-02 — Payload identifica User/provider/método y session ref opaca sin access/refresh token, password, email, IP completa o user-agent crudo

- [ ] schema y aggregate cumplen v1;
- [ ] session ref es opaca;
- [ ] tokens, password, email, IP completa y user-agent crudo no aparecen.

### CAD-025-03 — Tenant context sólo aparece si fue validado; el evento no concede Membership, role, scope ni entitlement

- [ ] tenant context no validado no se publica;
- [ ] el evento no concede autorización;
- [ ] membership, role o scope siguen resolviéndose aparte.

### CAD-025-04 — Refresh silencioso no emite el evento salvo nueva versión/decisión explícita y una falla de publicación no invalida la sesión ya emitida

- [ ] refresh silencioso no produce evento v1;
- [ ] una falla de publicación no invalida la sesión emitida;
- [ ] cambios futuros requieren nueva decisión/versionado explícito.

### CAD-025-05 — Audit/analytics deduplican y aplican retención/acceso a señales de seguridad minimizadas

- [ ] audit y analytics deduplican;
- [ ] la retención sigue política aprobada;
- [ ] acceso a señales queda minimizado.

### CAD-025-06 — Schema, redacción, retry/DLQ y separación authentication/authorization poseen evidencia contractual

- [ ] redacción y separación authn/authz quedan verificadas;
- [ ] retry/DLQ posee evidencia;
- [ ] artifacts contractuales enlazan schema y políticas.
