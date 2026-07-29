## 1. Reusable ARCA client

- [x] 1.1 Create `@maitre/arca-client` with public types and explicit environment endpoints.
- [x] 1.2 Add injectable HTTP transport, clock, credentials, CMS signer and ticket cache ports.
- [x] 1.3 Implement safe SOAP envelope/response handling and normalized error types.
- [x] 1.4 Implement WSAA Login Ticket Request generation, signing, acquisition and renewal.
- [x] 1.5 Implement WSFEv1 health, last-authorized, CAE request, consultation and parameter calls.
- [x] 1.6 Add deterministic unit and contract tests with sanitized SOAP fixtures.

## 2. Maitre fiscal integration

- [x] 2.1 Expand fiscal snapshots and `ArcaAdapterPort` for required WSFEv1 fields.
- [x] 2.2 Add voucher/document/IVA/currency code mappings with versioned validation.
- [x] 2.3 Add authorization-attempt persistence and ambiguous-result states.
- [ ] 2.4 Add official-number synchronization and sequence coordination.
- [x] 2.5 Implement `Wsfev1ArcaAdapter` using `@maitre/arca-client`.
- [x] 2.6 Configure `FISCAL_ARCA_DRIVER=wsfev1` to fail closed; retain simulated mode for tests/dev.
- [x] 2.7 Rename/extend fiscal identity data to explicit `legalName` plus optional display alias.
- [x] 2.8 Add `subscriberFiscalEntityId` to subscription with same-tenant FK and audited mutation.
- [x] 2.9 Add branch ownership, ARCA domicile and issuing-system fields to fiscal points of sale.
- [x] 2.10 Add declared/verified/rejected registration lifecycle and verification evidence.
- [x] 2.11 Block production issuance unless fiscal entity, branch domicile and point of sale are
  active and verified for the requested issuing system.
- [x] 2.12 Migrate existing tenants by explicitly selecting a subscriber fiscal entity and mapping
  every production point of sale to a branch; do not infer ambiguous ownership.

## 3. Verification and operations

- [x] 3.1 Test success, observed authorization, rejection, SOAP fault and transport ambiguity.
- [x] 3.2 Test ticket caching/renewal and ensure secrets are absent from errors/logs.
- [x] 3.3 Document WSASS certificate and homologation setup.
- [x] 3.4 Run typecheck and fiscal/API test suites.
- [x] 3.5 Run credentialed homologation smoke tests when testing credentials are supplied.
- [x] 3.6 Record production blockers and keep production issuance gated.
