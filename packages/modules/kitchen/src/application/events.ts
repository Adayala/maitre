// SPEC-106/107/108 — Kitchen outbox events. Envelope shape mirrors
// @maitre/ordering's events.ts. Payloads omit PII, free-text notes, textual
// modifiers and prices per the event contracts.
//
//   kitchen.command.received.v1    — on Command creation (RECEIVED)
//   kitchen.command.in-progress.v1 — once, on CLAIMED -> IN_PROGRESS (NOT on claim,
//                                     NOT on ON_HOLD -> IN_PROGRESS resume)
//   kitchen.command.ready.v1       — on -> READY
//   kitchen.command.completed.v1   — on -> COMPLETED (handoff)

import { randomUUID } from "node:crypto";
import type { Command } from "../domain/command.js";
import type { OutboxRecord } from "./outbox.js";

function record<T>(
  eventName: string,
  aggregateId: string,
  tenantId: string,
  correlationId: string,
  occurredAt: Date,
  payload: T,
): OutboxRecord<T> {
  return {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    occurredAt,
    producer: "kitchen",
    tenantId,
    aggregateType: "Command",
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

export interface CommandReceivedPayload {
  commandId: string;
  branchId: string;
  stationId: string;
  orderId: string;
  orderItemId: string;
  priority: number;
  aggregateRevision: number;
  receivedAt: Date;
}

export function commandReceivedEvent(command: Command, correlationId: string): OutboxRecord<CommandReceivedPayload> {
  return record("kitchen.command.received.v1", command.id, command.tenantId, correlationId, command.receivedAt, {
    commandId: command.id,
    branchId: command.branchId,
    stationId: command.stationId,
    orderId: command.orderId,
    orderItemId: command.orderItemId,
    priority: command.priority,
    aggregateRevision: command.revision,
    receivedAt: command.receivedAt,
  });
}

export interface CommandInProgressPayload {
  commandId: string;
  branchId: string;
  stationId: string;
  aggregateRevision: number;
  startedAt: Date;
}

export function commandInProgressEvent(
  command: Command,
  startedAt: Date,
  correlationId: string,
): OutboxRecord<CommandInProgressPayload> {
  return record("kitchen.command.in-progress.v1", command.id, command.tenantId, correlationId, startedAt, {
    commandId: command.id,
    branchId: command.branchId,
    stationId: command.stationId,
    aggregateRevision: command.revision,
    startedAt,
  });
}

export interface CommandReadyPayload {
  commandId: string;
  branchId: string;
  stationId: string;
  orderId: string;
  orderItemId: string;
  aggregateRevision: number;
  readyAt: Date;
}

export function commandReadyEvent(command: Command, readyAt: Date, correlationId: string): OutboxRecord<CommandReadyPayload> {
  return record("kitchen.command.ready.v1", command.id, command.tenantId, correlationId, readyAt, {
    commandId: command.id,
    branchId: command.branchId,
    stationId: command.stationId,
    orderId: command.orderId,
    orderItemId: command.orderItemId,
    aggregateRevision: command.revision,
    readyAt,
  });
}

export interface CommandCompletedPayload {
  commandId: string;
  branchId: string;
  stationId: string;
  orderId: string;
  orderItemId: string;
  aggregateRevision: number;
  completedAt: Date;
}

export function commandCompletedEvent(
  command: Command,
  completedAt: Date,
  correlationId: string,
): OutboxRecord<CommandCompletedPayload> {
  return record("kitchen.command.completed.v1", command.id, command.tenantId, correlationId, completedAt, {
    commandId: command.id,
    branchId: command.branchId,
    stationId: command.stationId,
    orderId: command.orderId,
    orderItemId: command.orderItemId,
    aggregateRevision: command.revision,
    completedAt,
  });
}
