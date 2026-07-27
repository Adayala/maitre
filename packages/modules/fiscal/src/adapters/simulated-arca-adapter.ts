// ===========================================================================
// ██  SIMULATED ARCA ADAPTER — NOT A REAL FISCAL INTEGRATION  ██
// ===========================================================================
// This adapter generates FAKE CAE values for MVP walking-skeleton purposes ONLY.
// It performs NO network calls, uses NO certificates, speaks NO SOAP, and
// contacts NEITHER AFIP NOR ARCA. Every "authorization" it returns is invented
// locally.
//
// It MUST be replaced with a real WSAA/WSFEv1 client and real AFIP/ARCA
// credentials before this system is used to issue actual fiscal invoices in
// Argentina. Issuing invoices with these fake CAE values in production is
// ILLEGAL. Do not deploy this adapter to a production fiscal path.
//
// It implements ArcaAdapterPort so a real adapter can be swapped in behind the
// composition root without touching Invoice's domain/application code.
// ===========================================================================

import { randomBytes } from "node:crypto";
import type {
  ArcaAdapterPort,
  ArcaAuthorizationRequest,
  ArcaAuthorizationResult,
} from "../application/ports.js";

export interface SimulatedArcaOptions {
  now?: () => Date;
  // Number of days out the fake CAE "expires". AFIP CAEs are ~10 days.
  caeValidityDays?: number;
}

export class SimulatedArcaAdapter implements ArcaAdapterPort {
  private readonly now: () => Date;
  private readonly caeValidityDays: number;

  constructor(options: SimulatedArcaOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.caeValidityDays = options.caeValidityDays ?? 10;
  }

  // Synchronously "authorizes" the request with a fake CAE. There is no
  // timeout / ambiguous-outcome path here, so the caller never sees
  // PENDING_RECONCILIATION from this adapter.
  async authorize(request: ArcaAuthorizationRequest): Promise<ArcaAuthorizationResult> {
    // A clearly-fake 14-digit CAE, prefixed so it can never be mistaken for a
    // real one. 14 digits matches AFIP's CAE length purely for shape parity.
    const digits = BigInt("0x" + randomBytes(8).toString("hex")).toString().padStart(14, "0").slice(-14);
    const cae = `SIM${digits}`; // "SIM" prefix => obviously not a real CAE
    const issuedAt = this.now();
    const caeExpiresAt = new Date(issuedAt.getTime() + this.caeValidityDays * 24 * 60 * 60 * 1000);
    return {
      outcome: "AUTHORIZED",
      cae,
      caeExpiresAt,
      providerRef: `SIMULATED:${request.environment}:${request.pointOfSaleCode}:${request.voucherType}:${request.number}`,
    };
  }
}
