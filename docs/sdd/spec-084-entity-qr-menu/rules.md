# Rules — SPEC-084

- Token público debe ser opaco, no secuencial y de alta entropía.
- Sólo se almacena hash/fingerprint; el valor completo no aparece en logs ni métricas.
- Cliente nunca aporta `tenantId`, `branchId` ni `menuRevisionId` como autoridad.
- Respuesta uniforme y rate-limited para capability inválida, ausente, vencida o revocada.
- Cache key depende de capability/revision/locale aprobados; rotación invalida el estado previo.
- Purpose `MENU_READ` no se reutiliza para mutaciones ni lectura de bill/payment.
