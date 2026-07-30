import type {
  JourneyOutboxEvent,
  OutboxOperationalSnapshot,
  OutboxOperationsPort,
  OutboxRecord,
} from "@maitre/organization";
import { currentRequestTelemetryContext } from "../http/observability.js";

export class ContextPropagatingOutbox implements OutboxOperationsPort {
  constructor(private readonly delegate: OutboxOperationsPort) {}

  append(record: OutboxRecord): Promise<void> {
    const context = currentRequestTelemetryContext();
    return this.delegate.append({
      ...record,
      ...(context
        ? {
            correlationId: context.correlationId,
            ...(context.traceparent
              ? { traceparent: context.traceparent }
              : {}),
          }
        : {}),
    });
  }

  getOperationalSnapshot(input?: {
    tenantId?: string;
    now?: Date;
  }): Promise<OutboxOperationalSnapshot> {
    return this.delegate.getOperationalSnapshot(input);
  }

  listJourneyEvents(limit?: number): Promise<readonly JourneyOutboxEvent[]> {
    return this.delegate.listJourneyEvents(limit);
  }

  claimJourneyEvent(
    eventId: string,
    claimedAt: Date,
    leaseMs: number,
  ): Promise<boolean> {
    return this.delegate.claimJourneyEvent(eventId, claimedAt, leaseMs);
  }

  markJourneyEventObserved(eventId: string, observedAt: Date): Promise<void> {
    return this.delegate.markJourneyEventObserved(eventId, observedAt);
  }
}
