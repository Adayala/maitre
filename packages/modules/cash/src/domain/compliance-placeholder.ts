// SPEC-136 — Cash Compliance Rules: PLACEHOLDER ONLY.
//
// The full SPEC-136 fraud/compliance rule engine (a versioned PolicyVersion
// entity with owner/provenance/thresholds/reviewer/fixtures, plus an evaluator
// producing explainable findings with ruleId/ruleVersion/severity/confidence/
// evidenceWindow/accessClassification for signals like amount-splitting,
// repeated differences and self-approval) is OUT OF SCOPE for this MVP walking
// skeleton (I0). It is deferred entirely — no PolicyVersion entity, no findings
// evaluator, no routes and no tests are built for it. This is not a P0 concern
// for I0.
//
// This file exists only to document that decision; it intentionally exports
// nothing runtime.
export {};
