// SPEC-141 — FiscalQrCode. A pure, deterministic derivation from an AUTHORIZED
// Invoice's minimal fiscal fields: same input + same format version => identical
// canonical payload + identical hash, bit for bit.
//
// DEFERRED (documented): real SVG/PNG image rendering and AFIP's actual QR URL
// format (base64 of a JSON payload under https://www.afip.gob.ar/fe/qr/?p=...).
// This proves only the payload/hash determinism invariant; a real renderer per
// the NormativeSourceRegistry replaces it later. The client never supplies the
// payload — it is derived here from authoritative fiscal fields only. No
// secrets/tokens/credentials are ever included.

import { createHash } from "node:crypto";

export const FISCAL_QR_FORMAT_VERSION = "mvp-canonical-1";
export const FISCAL_QR_NORMATIVE_VERSION = "SIMULATED-NONE";

export interface FiscalQrInput {
  cuit: string;
  voucherType: string;
  pointOfSaleCode: string;
  number: number;
  amountMinorUnits: number;
  currency: string;
  cae: string;
  caeExpiresAt: Date;
  authorizedAt: Date;
}

export interface FiscalQrCode {
  formatVersion: string;
  normativeVersion: string;
  canonicalPayload: string;
  payloadHash: string;
}

// Canonical payload: a fixed-order, pipe-delimited string of the minimal fiscal
// fields. Field order is frozen with the format version — changing it requires a
// new FISCAL_QR_FORMAT_VERSION so historical representations never mutate.
export function buildFiscalQrPayload(input: FiscalQrInput): string {
  return [
    `ver=${FISCAL_QR_FORMAT_VERSION}`,
    `cuit=${input.cuit}`,
    `ptoVta=${input.pointOfSaleCode}`,
    `tipoCmp=${input.voucherType}`,
    `nroCmp=${input.number}`,
    `importe=${input.amountMinorUnits}`,
    `moneda=${input.currency}`,
    `cae=${input.cae}`,
    `caeVto=${input.caeExpiresAt.toISOString()}`,
    `fecha=${input.authorizedAt.toISOString()}`,
  ].join("|");
}

export function buildFiscalQrCode(input: FiscalQrInput): FiscalQrCode {
  const canonicalPayload = buildFiscalQrPayload(input);
  const payloadHash = createHash("sha256").update(canonicalPayload).digest("hex");
  return {
    formatVersion: FISCAL_QR_FORMAT_VERSION,
    normativeVersion: FISCAL_QR_NORMATIVE_VERSION,
    canonicalPayload,
    payloadHash,
  };
}
