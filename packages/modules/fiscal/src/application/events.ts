// SPEC-151/152/153 — Fiscal outbox events. Envelope shape mirrors the other
// modules' events.ts.
//
// SPEC-151 fiscal.invoice.validated.v1 — emitted on DRAFT -> VALIDATED. Payload
//   carries fiscalEntity/invoice ids, voucherType, currency, totals, source
//   Check revision and aggregateRevision. Omits recipient/PII. Dedup key is
//   (invoiceId, eventType, aggregateRevision).
// SPEC-152 fiscal.invoice.authorized.v1 — emitted on -> AUTHORIZED. Payload
//   carries fiscalEntity/pointOfSale/invoice ids, voucherType, number, currency,
//   totals, cae, caeExpiresAt and aggregateRevision. Omits PII.
//
// SPEC-153 fiscal.authorization.resolved.v1 is a TECHNICAL event for closing an
// external ARCA operation (direct or ambiguous). Because the SimulatedArcaAdapter
// always resolves SYNCHRONOUSLY within the issue call, there is no separate
// ambiguous/async resolution moment distinct from the authorize call itself — so
// this MVP does NOT emit SPEC-153. It becomes relevant only when a real adapter
// (that can time out ambiguously and later reconcile) replaces the simulation.

import { randomUUID } from "node:crypto";
import type { Invoice } from "../domain/invoice.js";
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
    producer: "fiscal",
    tenantId,
    aggregateType: "Invoice",
    aggregateId,
    correlationId,
    payload,
    status: "PENDING",
    attempts: 0,
  };
}

export interface InvoiceValidatedPayload {
  tenantId: string;
  fiscalEntityId: string;
  invoiceId: string;
  voucherType: string;
  currency: string;
  netMinorUnits: number;
  taxAmountMinorUnits: number;
  grossMinorUnits: number;
  sourceCheckRevision?: number;
  aggregateRevision: number;
}

export function invoiceValidatedEvent(invoice: Invoice, correlationId: string): OutboxRecord<InvoiceValidatedPayload> {
  return record("fiscal.invoice.validated.v1", invoice.id, invoice.tenantId, correlationId, invoice.validatedAt ?? new Date(), {
    tenantId: invoice.tenantId,
    fiscalEntityId: invoice.fiscalEntityId,
    invoiceId: invoice.id,
    voucherType: invoice.voucherType,
    currency: invoice.currency,
    netMinorUnits: invoice.totals.netMinorUnits,
    taxAmountMinorUnits: invoice.totals.taxAmountMinorUnits,
    grossMinorUnits: invoice.totals.grossMinorUnits,
    aggregateRevision: invoice.revision,
    ...(invoice.sourceCheckRevision != null ? { sourceCheckRevision: invoice.sourceCheckRevision } : {}),
  });
}

export interface InvoiceAuthorizedPayload {
  tenantId: string;
  fiscalEntityId: string;
  pointOfSaleId: string;
  invoiceId: string;
  voucherType: string;
  number: number;
  currency: string;
  netMinorUnits: number;
  taxAmountMinorUnits: number;
  grossMinorUnits: number;
  // The simulated adapter's CAE is non-sensitive fake data, so it is included
  // plainly here. A real adapter's CAE MAY require a redaction-policy review
  // before it is placed on the event bus — revisit when swapping the adapter.
  cae: string;
  caeExpiresAt: Date;
  aggregateRevision: number;
}

export function invoiceAuthorizedEvent(invoice: Invoice, correlationId: string): OutboxRecord<InvoiceAuthorizedPayload> {
  return record("fiscal.invoice.authorized.v1", invoice.id, invoice.tenantId, correlationId, invoice.authorizedAt ?? new Date(), {
    tenantId: invoice.tenantId,
    fiscalEntityId: invoice.fiscalEntityId,
    pointOfSaleId: invoice.pointOfSaleId,
    invoiceId: invoice.id,
    voucherType: invoice.voucherType,
    number: invoice.number ?? 0,
    currency: invoice.currency,
    netMinorUnits: invoice.totals.netMinorUnits,
    taxAmountMinorUnits: invoice.totals.taxAmountMinorUnits,
    grossMinorUnits: invoice.totals.grossMinorUnits,
    cae: invoice.cae ?? "",
    caeExpiresAt: invoice.caeExpiresAt ?? new Date(),
    aggregateRevision: invoice.revision,
  });
}
