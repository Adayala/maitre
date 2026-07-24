# Reglas — SPEC-067

- Guest y todos sus ContactPoints/Aliases tienen alcance tenant.
- Guest puede existir sin email ni teléfono; búsqueda exacta usa índices protegidos por política.
- Nombre/displayName no constituye identidad ni criterio suficiente de merge.
- Consentimiento se evalúa por purpose/channel y nunca se inventa durante merge.
- Revocación impide usos futuros y activa retention treatment aplicable.
- Merge bloquea canonicals en orden estable, es idempotente y no reescribe snapshots históricos.
- Export/anonymize son workflows auditados; anonymize no borra obligaciones legales.
- Proyecciones de visitas pueden estar stale y nunca autorizan una operación.
