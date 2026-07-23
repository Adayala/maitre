import { randomUUID } from "node:crypto";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { OutboxRecord } from "./outbox.js";

export interface ServiceActivatedPayload {
  subscriptionId: string;
  serviceId: string;
  activatedAt: Date;
}

// SPEC-033
export function serviceActivatedEvent(
  item: SubscriptionItem,
  tenantId: string,
  correlationId: string,
): OutboxRecord<ServiceActivatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "ServiceActivated",
    eventVersion: 1,
    occurredAt: item.activatedAt,
    producer: "subscription",
    tenantId,
    aggregateType: "Subscription",
    aggregateId: item.subscriptionId,
    correlationId,
    payload: {
      subscriptionId: item.subscriptionId,
      serviceId: item.serviceId,
      activatedAt: item.activatedAt,
    },
    status: "PENDING",
    attempts: 0,
  };
}

export interface ServiceDeactivatedPayload {
  subscriptionId: string;
  serviceId: string;
  deactivatedAt: Date;
}

// SPEC-034
export function serviceDeactivatedEvent(
  item: SubscriptionItem,
  tenantId: string,
  correlationId: string,
): OutboxRecord<ServiceDeactivatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "ServiceDeactivated",
    eventVersion: 1,
    occurredAt: item.deactivatedAt ?? new Date(),
    producer: "subscription",
    tenantId,
    aggregateType: "Subscription",
    aggregateId: item.subscriptionId,
    correlationId,
    payload: {
      subscriptionId: item.subscriptionId,
      serviceId: item.serviceId,
      deactivatedAt: item.deactivatedAt ?? new Date(),
    },
    status: "PENDING",
    attempts: 0,
  };
}
