# Rules — SPEC-228

- `code` es estable, no vacío y no se reutiliza.
- `unitPrice` es no negativo; `version` es un entero positivo.
- El único período soportado actualmente es `MONTHLY`.
- Un ítem inactivo no admite nuevas altas, pero sigue resolviendo contratos históricos.
- Todo alcance excepto `TENANT` exige `scopeRefId` en SubscriptionItem.
- Cambiar precio o condiciones no modifica retroactivamente `unitPrice` de ítems contratados.
- Todo ítem activo debe explicar de forma breve qué capacidad agrega y enumerar únicamente
  beneficios específicos de esa capacidad; se evitan frases genéricas sobre precio o activación.
- La UI consume descripción y beneficios desde API; no mantiene copias hardcodeadas.
