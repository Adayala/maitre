// SPEC-143/149 — TaxRate use cases: create (DRAFT), publish (no-overlap invariant),
// supersede, resolve. A published, used rate is immutable.

import { randomUUID } from "node:crypto";
import {
  type TaxRate,
  type TaxTreatment,
  assertValidDecimalRate,
  assertNoPublishedOverlap,
  resolveTaxRate,
  InvalidTaxRateError,
} from "../domain/tax-rate.js";
import type { TaxRateRepositoryPort } from "./ports.js";

export interface TaxRateDeps {
  taxRates: TaxRateRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface CreateTaxRateInput {
  id?: string;
  jurisdiction: string;
  taxType: string;
  officialCode: string;
  treatment: TaxTreatment;
  decimalRate: number; // basis points
  includedInPrice: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  normativeSourceVersion: string;
  supersedes?: string;
}

export async function createTaxRate(deps: TaxRateDeps, input: CreateTaxRateInput): Promise<TaxRate> {
  assertValidDecimalRate(input.treatment, input.decimalRate);
  if (input.effectiveTo && input.effectiveTo.getTime() <= input.effectiveFrom.getTime()) {
    throw new InvalidTaxRateError("effectiveTo must be after effectiveFrom");
  }
  const now = nowFrom(deps);
  const rate: TaxRate = {
    id: input.id ?? randomUUID(),
    jurisdiction: input.jurisdiction,
    taxType: input.taxType,
    officialCode: input.officialCode,
    treatment: input.treatment,
    decimalRate: input.decimalRate,
    includedInPrice: input.includedInPrice,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo ?? null,
    normativeSourceVersion: input.normativeSourceVersion,
    status: "DRAFT",
    supersedes: input.supersedes ?? null,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.taxRates.save(rate);
  return rate;
}

export async function listTaxRates(deps: TaxRateDeps): Promise<TaxRate[]> {
  return deps.taxRates.listAll();
}

export async function publishTaxRate(deps: TaxRateDeps, input: { id: string }): Promise<TaxRate> {
  const rate = await deps.taxRates.findById(input.id);
  if (!rate) throw new Error(`TaxRate ${input.id} not found`);
  if (rate.status === "PUBLISHED") return rate;
  const siblings = await deps.taxRates.listByKey(rate.jurisdiction, rate.taxType, rate.officialCode);
  const candidate: TaxRate = { ...rate, status: "PUBLISHED" };
  // Enforce no overlap against already-PUBLISHED siblings sharing the key.
  assertNoPublishedOverlap(candidate, siblings.filter((s) => s.status === "PUBLISHED"));
  const now = nowFrom(deps);
  const published: TaxRate = { ...candidate, updatedAt: now, revision: rate.revision + 1 };
  await deps.taxRates.save(published);
  return published;
}

// Supersede: close the current PUBLISHED rate's interval at `effectiveTo` and
// create a new DRAFT rate that supersedes it. The new rate is published
// separately (which re-checks the no-overlap invariant).
export async function supersedeTaxRate(
  deps: TaxRateDeps,
  input: CreateTaxRateInput & { supersedesId: string },
): Promise<TaxRate> {
  const prior = await deps.taxRates.findById(input.supersedesId);
  if (!prior) throw new Error(`TaxRate ${input.supersedesId} not found`);
  return createTaxRate(deps, { ...input, supersedes: prior.id });
}

export interface ResolveTaxRateResult {
  jurisdiction: string;
  taxType: string;
  at: string;
  resolved: TaxRate | null;
}

// SPEC-143/154 — resolve fails closed: `resolved` is null when no PUBLISHED rate
// is in effect ("sin código vigente se bloquea emisión").
export async function resolveTaxRateQuery(
  deps: TaxRateDeps,
  input: { jurisdiction: string; taxType: string; at: Date },
): Promise<ResolveTaxRateResult> {
  const all = await deps.taxRates.listAll();
  const resolved = resolveTaxRate(all, input.jurisdiction, input.taxType, input.at);
  return { jurisdiction: input.jurisdiction, taxType: input.taxType, at: input.at.toISOString(), resolved };
}
