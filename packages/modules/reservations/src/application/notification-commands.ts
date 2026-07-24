// Reservation Notifications use cases (SPEC-075). See
// domain/notification-intent.ts for the scope note: these 3 commands only
// create+persist a NotificationIntent record and append an outbox event —
// NO real provider/SMS/email send is integrated.

import { randomUUID } from "node:crypto";
import type { NotificationIntent, NotificationIntentPurpose } from "../domain/notification-intent.js";
import type { NotificationIntentRepositoryPort } from "./ports.js";
import type { OutboxPort, OutboxRecord } from "./outbox.js";

export interface NotificationDeps {
  notificationIntents: NotificationIntentRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

export interface CreateNotificationIntentInput {
  tenantId: string;
  reservationId: string;
  correlationId?: string;
}

async function createIntent(
  deps: NotificationDeps,
  purpose: NotificationIntentPurpose,
  eventName: string,
  input: CreateNotificationIntentInput,
): Promise<NotificationIntent> {
  const now = (deps.now ?? (() => new Date()))();
  const intent: NotificationIntent = {
    id: randomUUID(),
    tenantId: input.tenantId,
    reservationId: input.reservationId,
    purpose,
    status: "CREATED",
    createdAt: now,
  };
  await deps.notificationIntents.save(intent);

  const record: OutboxRecord = {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    occurredAt: now,
    producer: "reservations",
    tenantId: input.tenantId,
    aggregateType: "NotificationIntent",
    aggregateId: intent.id,
    correlationId: input.correlationId ?? randomUUID(),
    payload: { notificationIntentId: intent.id, reservationId: input.reservationId, purpose },
    status: "PENDING",
    attempts: 0,
  };
  await deps.outbox.append(record);
  return intent;
}

// POST /v1/reservations/{id}/notification-intents/request-confirmation
export function requestReservationConfirmation(
  deps: NotificationDeps,
  input: CreateNotificationIntentInput,
): Promise<NotificationIntent> {
  return createIntent(
    deps,
    "REQUEST_CONFIRMATION",
    "reservations.notification-intent.request-confirmation.v1",
    input,
  );
}

// POST /v1/reservations/{id}/notification-intents/send-reminder
export function sendReservationReminder(
  deps: NotificationDeps,
  input: CreateNotificationIntentInput,
): Promise<NotificationIntent> {
  return createIntent(deps, "SEND_REMINDER", "reservations.notification-intent.send-reminder.v1", input);
}

// POST /v1/reservations/{id}/notification-intents/communicate-cancellation
export function communicateReservationCancellation(
  deps: NotificationDeps,
  input: CreateNotificationIntentInput,
): Promise<NotificationIntent> {
  return createIntent(
    deps,
    "COMMUNICATE_CANCELLATION",
    "reservations.notification-intent.communicate-cancellation.v1",
    input,
  );
}
