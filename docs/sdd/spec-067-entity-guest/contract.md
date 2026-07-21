# Contrato — SPEC-067 Guest

Guest es perfil opcional del comensal dentro de Tenant; no equivale a User autenticado.
Campos minimizados: display name, contactos normalizados/verificados, locale, consent flags,
preferences referenciadas, merge status y auditoría. Identidad no se deduplica sólo por
nombre; email/teléfono se usan según consentimiento y política. Merge conserva aliases e
historia y es reversible operacionalmente. Tests cubren duplicados, opt-out, redacción,
retención/export y aislamiento tenant.
