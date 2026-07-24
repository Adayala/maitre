// SPEC-075 — NotificationIntent domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the 3
// command endpoints (request-confirmation, send-reminder,
// communicate-cancellation) just create+persist this simple record and
// append an outbox event; there is NO real provider/SMS/email send, no
// template versioning/locale resolution, no rate-limit/dedupe window, no
// delivery-status projection. `status` is always CREATED — this is a
// deliberately deferred no-op delivery pipeline, documented here rather
// than at the route layer.

export type NotificationIntentPurpose =
  | "REQUEST_CONFIRMATION"
  | "SEND_REMINDER"
  | "COMMUNICATE_CANCELLATION";

export interface NotificationIntent {
  id: string;
  tenantId: string;
  reservationId: string;
  purpose: NotificationIntentPurpose;
  status: "CREATED";
  createdAt: Date;
}
