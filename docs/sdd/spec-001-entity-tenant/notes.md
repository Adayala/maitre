# Notas — SPEC-001

## Asunciones

- Email validación es simple RFC 5322 básica (user@domain.com)
- Timezone IANA list es fija y no cambia frecuentemente
- Owner user se crea automáticamente sin password inicial (reset por email)
- Suscripción TRIALING de 14 días es valor por defecto
- Tenant.email puede cambiar (es editable), pero debe mantenerse único

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Email collision (duplicate register) | Baja | Alto | Unique constraint DB + app validation |
| Timezone invalid after deployment | Baja | Medio | Validate against hardcoded IANA list |
| Concurrency on creation | Media | Medio | Optimistic locking, retry logic |
| Owner user creation fails | Baja | Alto | Transactional: tenant creation rolls back |

## Decisiones de diseño

### Email como unique key global (no per-tenant)

**Contexto:** ¿Es email único globalmente o por tenant?

**Alternativas:**
1. Unique globally (único en toda Maitre)
2. Unique per-tenant (múltiples tenants pueden tener same email)

**Decisión:** Unique globally
**Por qué:** Simplifica login, previene confusión, estándar en SaaS

---

### Auto-create subscription on tenant creation

**Contexto:** ¿Cuándo se crea subscription?

**Alternativas:**
1. Manual (user must explicitly create)
2. Auto-create TRIALING (crear automáticamente)

**Decisión:** Auto-create TRIALING
**Por qué:** Reduce fricción, tenant listo para usar inmediatamente, mejor UX

---

### Owner user auto-creation

**Contexto:** ¿Quién es el primer usuario?

**Alternativas:**
1. Manual invite (send email)
2. Auto-create with same email as tenant (auto-created)

**Decisión:** Auto-create with email verification
**Por qué:** Faster onboarding, user already knows password flow

---

## Cambios posteriores

None yet (first version).

## Referencias

- [RFC 5322](https://tools.ietf.org/html/rfc5322) — Email format
- [IANA Timezone Database](https://www.iana.org/time-zones) — Válid timezones
- [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) — Country codes

## Conversaciones relacionadas

- D-001: Multi-tenant architecture decision
- D-002: Tenant isolation strategy

## Autor y revisores

| Rol | Nombre | Estado |
| --- | --- | --- |
| Autor | @faguero | ✅ |
| Revisor 1 | @peer1 | ⏳ |
| Revisor 2 | @peer2 | ⏳ |

## Historial

| Versión | Cambio | Fecha |
| --- | --- | --- |
| v1.0 | Creación | 2026-07-20 |
