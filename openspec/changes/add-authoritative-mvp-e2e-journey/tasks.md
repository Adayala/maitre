## 1. Hermetic harness foundation

- [ ] 1.1 Add run ID/seed/clock helpers and an E2E manifest schema.
- [ ] 1.2 Add controlled role fixture identities and fail-closed environment guards.
- [ ] 1.3 Provision Tenant A/B and minimum branch/menu/station/register/service-period state.
- [ ] 1.4 Add idempotent reset/cleanup verification and classify `INFRA_ERROR`.

## 2. Cross-application project

- [ ] 2.1 Add the Playwright `journeys` project and start API, Floor, Kitchen and Cash builds.
- [ ] 2.2 Add authenticated browser fixtures and a tenant-aware black-box API client.
- [ ] 2.3 Add diagnostics for correlation IDs, last observed state and unexpected console/network
  errors.
- [ ] 2.4 Reclassify request-fulfilled app tests as UI-contract tests, not release journey evidence.

## 3. Authoritative MVP-J-001

- [ ] 3.1 Seat guests, open a visit, create an order and submit a real kitchen command through Floor.
- [ ] 3.2 Claim, start, ready and hand off the real command through Kitchen.
- [ ] 3.3 Observe delivery and request the real bill through Floor.
- [ ] 3.4 Display the pending check and capture one exact-balance manual payment through Cash.
- [ ] 3.5 Close the visit and assert settled check, captured payment, cash movement and free table.
- [ ] 3.6 Assert one representative Tenant B read and write are denied.
- [ ] 3.7 Assert audit and correlation evidence for critical transitions.

## 4. CI and evidence

- [ ] 4.1 Run the release journey against ephemeral PostgreSQL/Supabase with migrations from zero.
- [ ] 4.2 Add the journey to affected PR checks and the unconditional release/deploy gate.
- [ ] 4.3 Publish JUnit/HTML plus trace/screenshots/log excerpts on failure with SHA, seed and run ID.
- [ ] 4.4 Prohibit skips/fixme/only, product request fulfillment and retry-based approval.
- [ ] 4.5 Run typecheck, Playwright journey, cleanup verification and strict OpenSpec validation.

