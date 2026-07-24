# Structure — SPEC-068

Estructura lógica:

- identidad/scope: `waitlistEntryId`, tenantId, branchId;
- grupo: `partySize`, `guestId?`, `contactPointId?`;
- orden: `arrivedAt`, `arrivalSequence`, `priorityBand`, `priorityReasonCode?`,
  `orderingPolicyVersion`;
- información: `quotedAt?`, `estimatedWaitRange?`, `estimatePolicyVersion?`;
- ciclo: status, notified/seated/cancelled/expired timestamps y terminal reason;
- vínculos: `allocationId?`, `visitId?`;
- control: revision, override metadata, auditoría e idempotencia.

El contacto no se copia en texto libre. ArrivalSequence es monotónica dentro de Branch y
business context; la persistencia conserva el orden original.
