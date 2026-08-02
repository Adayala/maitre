> Historial de implementación migrado al árbol SDD; SPEC-059 es la fuente normativa vigente.

## 1. Contract and pending read model

- [x] 1.1 Add a branch-scoped list operation to the Check repository port and both persistence
      adapters.
- [x] 1.2 Add `GET /v1/branches/:id/pending-checks` with permission/branch enforcement and
      server-calculated totals.
- [x] 1.3 Cover queue filtering, enrichment and cross-branch denial in API tests.

## 2. Cash payment surface

- [x] 2.1 Add typed pending-check/payment models and a focused React panel.
- [x] 2.2 Display loading, empty, error, selection and balance details in the named
      `Cobros pendientes` region.
- [x] 2.3 Compose idempotent create, capture and settle mutations with cash-session validation and
      zero-balance recovery.
- [x] 2.4 Add responsive, keyboard and screen-reader states consistent with the Cash ledger
      visual system.

## 3. Evidence and validation

- [x] 3.1 Add UI-contract coverage for pending selection, disabled cash capture and successful
      exact-balance settlement.
- [x] 3.2 Advance MVP-J-001 past the missing-surface assertion without mocking product requests.
- [x] 3.3 Run lint, typecheck, builds, targeted tests, OpenAPI checks and strict SDD
      validation.
