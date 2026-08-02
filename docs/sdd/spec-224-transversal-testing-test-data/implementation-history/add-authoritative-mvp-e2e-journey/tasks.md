> Historial de implementación migrado al árbol SDD; SPEC-224 es la fuente normativa vigente.

## 1. Hermetic harness foundation

- [x] 1.1 Add run ID/seed/clock helpers and an E2E manifest schema.
- [x] 1.2 Add controlled role fixture identities and fail-closed environment guards.
- [x] 1.3 Provision Tenant A/B and minimum branch/menu/station/register/service-period state.
- [x] 1.4 Add idempotent reset/cleanup verification and classify `INFRA_ERROR`.

## 2. Cross-application project

- [x] 2.1 Add the Playwright `journeys` project and start API, Floor, Kitchen and Cash builds.
- [x] 2.2 Add authenticated browser fixtures and a tenant-aware black-box API client.
- [x] 2.3 Add diagnostics for correlation IDs, last observed state and unexpected console/network
      errors.
- [x] 2.4 Reclassify request-fulfilled app tests as UI-contract tests, not release journey evidence.

## 3. Authoritative MVP-J-001

- [x] 3.1 Seat guests, open a visit, create an order and submit a real kitchen command through Floor.
- [x] 3.2 Claim, start, ready and hand off the real command through Kitchen.
- [x] 3.3 Observe delivery and request the real bill through Floor.
- [x] 3.4 Display the pending check and capture one exact-balance manual payment through Cash.
- [x] 3.5 Close the visit and assert settled check, captured payment, cash movement and free table.
- [x] 3.6 Assert one representative Tenant B read and write are denied.
- [x] 3.7 Assert audit and correlation evidence for critical transitions.

## 4. CI and evidence

- [x] 4.1 Run the release journey against ephemeral PostgreSQL/Supabase with migrations from zero.
- [x] 4.2 Add the journey to affected PR checks and the unconditional release/deploy gate.
- [x] 4.3 Publish JUnit/HTML plus trace/screenshots/log excerpts on failure with SHA, seed and run ID.
- [x] 4.4 Prohibit skips/fixme/only, product request fulfillment and retry-based approval.
- [x] 4.5 Run typecheck, Playwright journey, cleanup verification and strict SDD validation.
