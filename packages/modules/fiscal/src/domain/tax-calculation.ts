// SPEC-154 — Tax calculation. Pure, deterministic function over line inputs +
// a resolved TaxRate. Same input => same output; the client's amounts are never
// authoritative (only the net base is taken; every derived amount is computed
// here). Money is integer minor units throughout.
//
// MVP scope: `includedInPrice` (tax-included) pricing is NOT computed — every
// line is treated as tax-EXCLUDED (the net base is the taxable base and tax is
// added on top). Tax-included extraction and explicit rounding-residue
// declaration are a documented deferral (SPEC-154 "cuando la normativa exige
// cálculo tax-included"). Rounding is half-up on the per-line tax amount.

import type { InvoiceLineItem } from "./invoice.js";
import type { TaxRate } from "./tax-rate.js";

export interface TaxLineInput {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitNetMinorUnits: number;
  discountsAppliedMinorUnits?: number;
  sourceCheckLineRef?: string | null;
  discountApplicationRefs?: string[];
}

function roundHalfUp(value: number): number {
  return Math.round(value);
}

// Computes a single fiscal line item snapshot from a net base and a resolved
// TaxRate. netAfterDiscounts = quantity * unitNet - discounts (clamped at 0).
export function computeLineItem(input: TaxLineInput, rate: TaxRate): InvoiceLineItem {
  const discounts = input.discountsAppliedMinorUnits ?? 0;
  const gross = input.quantity * input.unitNetMinorUnits;
  const netAfterDiscounts = Math.max(0, gross - discounts);

  let taxableBase = 0;
  let exemptBase = 0;
  let nonTaxedBase = 0;
  let taxAmount = 0;

  switch (rate.treatment) {
    case "TAXED":
      taxableBase = netAfterDiscounts;
      // decimalRate is basis points (2100 = 21%). tax = base * bp / 10000.
      taxAmount = roundHalfUp((netAfterDiscounts * rate.decimalRate) / 10000);
      break;
    case "EXEMPT":
      exemptBase = netAfterDiscounts;
      break;
    case "NON_TAXED":
      nonTaxedBase = netAfterDiscounts;
      break;
  }

  return {
    id: input.id,
    description: input.description,
    quantity: input.quantity,
    unit: input.unit,
    unitNetMinorUnits: input.unitNetMinorUnits,
    discountsAppliedMinorUnits: discounts,
    taxRateVersion: rate.normativeSourceVersion,
    taxTreatment: rate.treatment,
    taxableBaseMinorUnits: taxableBase,
    exemptBaseMinorUnits: exemptBase,
    nonTaxedBaseMinorUnits: nonTaxedBase,
    taxAmountMinorUnits: taxAmount,
    grossTotalMinorUnits: netAfterDiscounts + taxAmount,
    sourceCheckLineRef: input.sourceCheckLineRef ?? null,
    discountApplicationRefs: input.discountApplicationRefs ?? [],
  };
}
