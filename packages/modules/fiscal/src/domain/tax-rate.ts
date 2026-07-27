// SPEC-143 — TaxRate domain model. Platform-level normative catalogue of tax
// rates: a tenant never creates official rates, it only maps Product/tax
// category to an existing (jurisdiction, taxType, officialCode).
//
// Real invariants implemented:
//   - `decimalRate` is a basis-points INTEGER (e.g. 21% => 2100 bp), never a
//     float — exact money semantics per SPEC-143 "precisión decimal exacta".
//   - No overlapping effective intervals among PUBLISHED rates for the same
//     (jurisdiction, taxType, officialCode) key (see assertNoPublishedOverlap).
//   - resolve() fails CLOSED: no vigent PUBLISHED code => no rate => the caller
//     (issue) must refuse to emit ("sin código vigente se bloquea emisión").
//
// DEFERRED (documented, out of MVP scope):
//   - NormativeSourceVersion registry / approval-source tracking is reduced to a
//     free `normativeSourceVersion` string field (no registry entity).
//   - Reviewer workflow and retroactive-change review process are not modelled;
//     supersede is a plain field pointing at the prior rate id.

export type TaxTreatment = "TAXED" | "EXEMPT" | "NON_TAXED";
export type TaxRateStatus = "DRAFT" | "PUBLISHED";

export interface TaxRate {
  id: string;
  jurisdiction: string;
  taxType: string;
  officialCode: string;
  treatment: TaxTreatment;
  // Basis points: 2100 = 21.00%. Integer only. EXEMPT/NON_TAXED carry 0.
  decimalRate: number;
  includedInPrice: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  normativeSourceVersion: string;
  status: TaxRateStatus;
  supersedes?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidTaxRateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTaxRateError";
  }
}

export class OverlappingTaxRateError extends Error {
  constructor(jurisdiction: string, taxType: string, officialCode: string) {
    super(
      `A PUBLISHED TaxRate already covers an overlapping interval for (${jurisdiction}, ${taxType}, ${officialCode})`,
    );
    this.name = "OverlappingTaxRateError";
  }
}

export class NoEffectiveTaxRateError extends Error {
  constructor(jurisdiction: string, taxType: string, at: Date) {
    super(`No PUBLISHED TaxRate in effect for (${jurisdiction}, ${taxType}) at ${at.toISOString()}`);
    this.name = "NoEffectiveTaxRateError";
  }
}

export function assertValidDecimalRate(treatment: TaxTreatment, decimalRate: number): void {
  if (!Number.isInteger(decimalRate) || decimalRate < 0) {
    throw new InvalidTaxRateError(`decimalRate ${decimalRate} must be a non-negative integer (basis points)`);
  }
  if (treatment !== "TAXED" && decimalRate !== 0) {
    throw new InvalidTaxRateError(`${treatment} rates must carry a 0 basis-points decimalRate`);
  }
}

// Two half-open intervals [from, to) overlap? A null `to` means open-ended.
function intervalsOverlap(
  aFrom: Date,
  aTo: Date | null | undefined,
  bFrom: Date,
  bTo: Date | null | undefined,
): boolean {
  const aEnd = aTo ? aTo.getTime() : Number.POSITIVE_INFINITY;
  const bEnd = bTo ? bTo.getTime() : Number.POSITIVE_INFINITY;
  return aFrom.getTime() < bEnd && bFrom.getTime() < aEnd;
}

// SPEC-143 — no overlap among PUBLISHED rates sharing the identity key. The
// candidate is checked against every already-PUBLISHED sibling (same key).
export function assertNoPublishedOverlap(candidate: TaxRate, publishedSiblings: readonly TaxRate[]): void {
  for (const sib of publishedSiblings) {
    if (sib.id === candidate.id) continue;
    if (
      sib.jurisdiction !== candidate.jurisdiction ||
      sib.taxType !== candidate.taxType ||
      sib.officialCode !== candidate.officialCode
    ) {
      continue;
    }
    if (intervalsOverlap(candidate.effectiveFrom, candidate.effectiveTo, sib.effectiveFrom, sib.effectiveTo)) {
      throw new OverlappingTaxRateError(candidate.jurisdiction, candidate.taxType, candidate.officialCode);
    }
  }
}

// Resolves the single PUBLISHED rate in effect for (jurisdiction, taxType) at
// `at`. Fails closed: returns null when nothing matches (the caller decides how
// to surface "no code, no invoice"). When multiple match (shouldn't happen given
// the no-overlap invariant) the most recently effective one wins deterministically.
export function resolveTaxRate(
  candidates: readonly TaxRate[],
  jurisdiction: string,
  taxType: string,
  at: Date,
): TaxRate | null {
  const t = at.getTime();
  const matches = candidates.filter(
    (r) =>
      r.status === "PUBLISHED" &&
      r.jurisdiction === jurisdiction &&
      r.taxType === taxType &&
      r.effectiveFrom.getTime() <= t &&
      (r.effectiveTo == null || r.effectiveTo.getTime() > t),
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0]!;
}
