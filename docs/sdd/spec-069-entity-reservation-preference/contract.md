# Contrato — SPEC-069 ReservationPreference

Preference es una señal declarada, no garantía: accessibility, seating zone, dietary note
u horario. Incluye guest/tenant, code tipado, value validado, priority, source, consent,
vigencia y auditoría. Texto libre se limita/sanitiza y datos sensibles se minimizan. El
motor explica preferencias no satisfechas sin bloquear salvo requirement explícito.
Tests cubren validación, precedence, expiración, redacción y eliminación/export del guest.
