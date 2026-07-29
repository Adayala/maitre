# Change: Add reusable ARCA electronic invoicing client

## Why

At the start of this change Maitre issued only simulated fiscal authorizations. Restaurants need real ARCA authorization
through WSAA and WSFEv1, while the low-level client should remain independent from Maitre so it can
be extracted and reused by other systems.

## What Changes

- Add a standalone `@maitre/arca-client` package with no dependency on Maitre domain modules.
- Model explicit homologation and production endpoints, defaulting to homologation.
- Add injectable HTTP, clock, credential, CMS signer, ticket cache and observability boundaries.
- Implement WSAA ticket acquisition and reuse for service `wsfe`.
- Implement the first WSFEv1 operations: health, last authorized number, CAE request, voucher
  consultation and parameter lookup.
- Normalize SOAP faults, ARCA errors, observations and ambiguous transport outcomes.
- Expand the fiscal authorization port to carry the complete WSFEv1 request data required by the
  supported A/B/C invoices and credit/debit notes.
- Add a Maitre adapter that maps the fiscal domain to the reusable client.
- Associate every subscription with one tenant fiscal entity acting as the legal subscriber,
  storing its CUIT, legal name and public fiscal profile separately from ARCA secrets.
- Associate every production fiscal point of sale with exactly one branch and its registered ARCA
  domicile; allow a branch to own multiple points of sale for different issuing systems.
- Track ARCA registration/verification state for domiciles and points of sale without pretending
  that WSFEv1 can create them.
- Keep production gated unless explicitly selected and fully configured. Never fall back to
  simulated authorization.

The first delivery targets homologation and does not claim production fiscal compliance.

## Delivery Status — 2026-07-29

- Reusable WSAA/WSFEv1 client and Maitre adapter implemented.
- Credentialed WSAA login and WSFEv1 `FEDummy` validated in homologation.
- Ownership/registration migration applied to the linked Supabase project.
- Existing development subscription, branch and homologation POS explicitly associated with the
  authorized fiscal entity; the mutation has an append-only audit record.
- The development legal name and domicile are placeholders and MUST NOT be promoted to production.
- Production remains gated by fiscal identity, valid certificate, active branch, domicile and a
  `VERIFIED` point of sale. Distributed cross-instance sequence coordination remains open.

## Impact

- Affected specs: `arca-electronic-invoicing`, organization fiscal entities/branches and
  subscription ownership
- Affected code: new `packages/arca-client`, `packages/modules/fiscal`, API composition and
  configuration, subscription/organization persistence and workspace TypeScript references.
- New dependencies may be introduced for audited XML parsing and CMS/PKCS#7 signing.
- The current small `ArcaAdapterPort` request is expanded before the real adapter is wired.
