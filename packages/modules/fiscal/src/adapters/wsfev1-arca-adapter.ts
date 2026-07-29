import {
  ArcaError,
  type WsfeCaeResult,
  type WsfeVoucherResult,
  type Wsfev1Client,
} from "@maitre/arca-client";
import type {
  ArcaAdapterPort,
  ArcaAuthorizationRequest,
  ArcaAuthorizationResult,
} from "../application/ports.js";
import type { VoucherType } from "../domain/invoice.js";

export interface Wsfev1ClientPort {
  getLastAuthorized(request: {
    pointOfSale: number;
    voucherType: number;
  }): ReturnType<Wsfev1Client["getLastAuthorized"]>;
  requestCae(request: Parameters<Wsfev1Client["requestCae"]>[0]): Promise<WsfeCaeResult>;
  consultVoucher?(request: {
    pointOfSale: number;
    voucherType: number;
    voucherNumber: number;
  }): Promise<WsfeVoucherResult>;
}

export interface Wsfev1ArcaAdapterOptions {
  clientFor(input: {
    cuit: string;
    environment: ArcaAuthorizationRequest["environment"];
  }): Wsfev1ClientPort;
}

/** Bump when an ARCA parameter-table review changes any fiscal mapping. */
export const ARCA_MAPPING_VERSION = "WSFEV1-2026-07";

export const ARCA_VOUCHER_CODES: Readonly<Record<VoucherType, number>> = {
  FACTURA_A: 1,
  NOTA_DEBITO_A: 2,
  NOTA_CREDITO_A: 3,
  FACTURA_B: 6,
  NOTA_DEBITO_B: 7,
  NOTA_CREDITO_B: 8,
  FACTURA_C: 11,
  NOTA_DEBITO_C: 12,
  NOTA_CREDITO_C: 13,
};

function pointOfSaleNumber(value: string): number {
  if (!/^\d{1,5}$/.test(value)) {
    throw new ArcaError("ARCA point of sale must contain between 1 and 5 digits", {
      kind: "CONFIGURATION",
    });
  }
  return Number.parseInt(value, 10);
}

function decimal(minorUnits: number): number {
  if (!Number.isSafeInteger(minorUnits)) {
    throw new ArcaError("Fiscal amount exceeds safe integer range", {
      kind: "CONFIGURATION",
    });
  }
  return minorUnits / 100;
}

function arcaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value["year"]}${value["month"]}${value["day"]}`;
}

function currencyCode(currency: string): string {
  if (currency === "ARS" || currency === "PES") return "PES";
  throw new ArcaError(
    `Currency ${currency} requires an explicit ARCA currency code and exchange rate`,
    { kind: "CONFIGURATION" },
  );
}

function expiryDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{8}$/.test(value)) return undefined;
  const date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00.000Z`,
  );
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function rejectionReason(result: WsfeCaeResult): string {
  const detailMessages = result.details.flatMap((detail) => detail.observations);
  const messages = [...result.errors, ...detailMessages]
    .map((message) => `${message.code}: ${message.message}`)
    .join("; ");
  return messages || "ARCA rejected the authorization request";
}

export class Wsfev1ArcaAdapter implements ArcaAdapterPort {
  private readonly sequenceTails = new Map<string, Promise<void>>();

  constructor(private readonly options: Wsfev1ArcaAdapterOptions) {}

  async authorize(request: ArcaAuthorizationRequest): Promise<ArcaAuthorizationResult> {
    const sequenceKey = [
      request.environment,
      request.cuit,
      request.pointOfSaleCode,
      request.voucherType,
    ].join(":");
    const previous = this.sequenceTails.get(sequenceKey) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    this.sequenceTails.set(sequenceKey, tail);
    await previous;
    try {
      return await this.authorizeWithinSequence(request);
    } finally {
      release();
      if (this.sequenceTails.get(sequenceKey) === tail) {
        this.sequenceTails.delete(sequenceKey);
      }
    }
  }

  private async authorizeWithinSequence(
    request: ArcaAuthorizationRequest,
  ): Promise<ArcaAuthorizationResult> {
    if (request.recipientVatConditionId === undefined) {
      throw new ArcaError("recipientVatConditionId is required by the current WSFEv1 contract", {
        kind: "CONFIGURATION",
      });
    }
    const expectedGross =
      request.taxableBaseMinorUnits +
      request.nonTaxedBaseMinorUnits +
      request.exemptBaseMinorUnits +
      request.taxAmountMinorUnits;
    if (request.grossMinorUnits !== expectedGross) {
      throw new ArcaError("Fiscal totals do not reconcile before WSFEv1 authorization", {
        kind: "CONFIGURATION",
      });
    }
    for (const vat of request.vatBreakdown) {
      if (!/^\d+$/.test(vat.officialCode)) {
        throw new ArcaError(`Invalid ARCA VAT code ${vat.officialCode}`, {
          kind: "CONFIGURATION",
        });
      }
    }
    const client = this.options.clientFor({
      cuit: request.cuit,
      environment: request.environment,
    });
    const pointOfSale = pointOfSaleNumber(request.pointOfSaleCode);
    const voucherType = ARCA_VOUCHER_CODES[request.voucherType];
    const last = await client.getLastAuthorized({ pointOfSale, voucherType });
    if (last.errors.length > 0) {
      return {
        outcome: "REJECTED",
        rejectionReason: last.errors
          .map((error) => `${error.code}: ${error.message}`)
          .join("; "),
      };
    }
    const assignedNumber = last.voucherNumber + 1;
    const providerRef =
      `${request.environment}:${request.cuit}:${pointOfSale}:${voucherType}:${assignedNumber}`;

    try {
      const result = await client.requestCae({
        pointOfSale,
        voucherType,
        details: [
          {
            concept: 1,
            recipientDocumentType: request.recipientDocumentType,
            recipientDocumentNumber: request.recipientDocumentNumber,
            voucherFrom: assignedNumber,
            voucherTo: assignedNumber,
            voucherDate: arcaDate(request.issuedAt),
            totalAmount: decimal(request.grossMinorUnits),
            nonTaxedAmount: decimal(request.nonTaxedBaseMinorUnits),
            netAmount: decimal(request.taxableBaseMinorUnits),
            exemptAmount: decimal(request.exemptBaseMinorUnits),
            vatAmount: decimal(request.taxAmountMinorUnits),
            taxAmount: 0,
            currencyId: currencyCode(request.currency),
            currencyRate: 1,
            recipientVatConditionId: request.recipientVatConditionId,
            vat: request.vatBreakdown.map((vat) => ({
              id: Number.parseInt(vat.officialCode, 10),
              taxableBase: decimal(vat.taxableBaseMinorUnits),
              amount: decimal(vat.taxAmountMinorUnits),
            })),
            ...(request.associatedVoucher
              ? {
                  associatedVouchers: [
                    {
                      voucherType: ARCA_VOUCHER_CODES[request.associatedVoucher.voucherType],
                      pointOfSale: pointOfSaleNumber(
                        request.associatedVoucher.pointOfSaleCode,
                      ),
                      voucherNumber: request.associatedVoucher.number,
                      cuit: request.cuit,
                    },
                  ],
                }
              : {}),
          },
        ],
      });
      const detail = result.details[0];
      if (result.result !== "A" || !detail || detail.result !== "A" || !detail.cae) {
        return {
          outcome: "REJECTED",
          assignedNumber,
          providerRef,
          rejectionReason: rejectionReason(result),
        };
      }
      const caeExpiresAt = expiryDate(detail.caeExpirationDate);
      return {
        outcome: "AUTHORIZED",
        assignedNumber,
        cae: detail.cae,
        ...(caeExpiresAt ? { caeExpiresAt } : {}),
        providerRef,
      };
    } catch (cause) {
      if (cause instanceof ArcaError && cause.outcomeAmbiguous) {
        return {
          outcome: "PENDING_RECONCILIATION",
          assignedNumber,
          providerRef,
          rejectionReason: "ARCA response is ambiguous; reconciliation is required",
        };
      }
      throw cause;
    }
  }

  async reconcile(request: {
    cuit: string;
    environment: ArcaAuthorizationRequest["environment"];
    pointOfSaleCode: string;
    voucherType: VoucherType;
    number: number;
  }): Promise<ArcaAuthorizationResult> {
    const pointOfSale = pointOfSaleNumber(request.pointOfSaleCode);
    const voucherType = ARCA_VOUCHER_CODES[request.voucherType];
    const providerRef =
      `${request.environment}:${request.cuit}:${pointOfSale}:${voucherType}:${request.number}`;
    const client = this.options.clientFor({
      cuit: request.cuit,
      environment: request.environment,
    });
    if (!client.consultVoucher) {
      throw new ArcaError("The WSFEv1 client does not support FECompConsultar", {
        kind: "CONFIGURATION",
      });
    }
    const result = await client.consultVoucher({
        pointOfSale,
        voucherType,
        voucherNumber: request.number,
      });
    if (!result.found || !result.detail) {
      return {
        outcome: "PENDING_RECONCILIATION",
        assignedNumber: request.number,
        providerRef,
        rejectionReason: result.errors.length
          ? result.errors.map((error) => `${error.code}: ${error.message}`).join("; ")
          : "Voucher is not observable in ARCA yet",
      };
    }
    if (result.detail.result !== "A" || !result.detail.cae) {
      return {
        outcome: "REJECTED",
        assignedNumber: request.number,
        providerRef,
        rejectionReason: result.detail.observations
          .map((message) => `${message.code}: ${message.message}`)
          .join("; ") || "ARCA reports the voucher as rejected",
      };
    }
    const caeExpiresAt = expiryDate(result.detail.caeExpirationDate);
    return {
      outcome: "AUTHORIZED",
      assignedNumber: request.number,
      cae: result.detail.cae,
      ...(caeExpiresAt ? { caeExpiresAt } : {}),
      providerRef,
    };
  }
}
