> Historial de implementación migrado al árbol SDD; SPEC-145 es la fuente normativa vigente.

## Context

ARCA exposes SOAP services over HTTPS. WSAA requires a signed CMS/PKCS#7 Login Ticket Request and
returns a time-limited Token/Sign pair for one service. WSFEv1 then authorizes and consults
electronic vouchers. Before this change, the Maitre adapter was simulated and its contract omitted
mandatory WSFEv1 fields. The delivery retains that adapter only for local/test use and adds a real,
selectable WSFEv1 adapter; simulated production vouchers fail closed.

Official test endpoints are available:

- WSAA homologation: `https://wsaahomo.afip.gov.ar/ws/services/LoginCms`
- WSFEv1 homologation: `https://wswhomo.afip.gov.ar/wsfev1/service.asmx`
- WSAA production: `https://wsaa.afip.gov.ar/ws/services/LoginCms`
- WSFEv1 production: `https://servicios1.afip.gov.ar/wsfev1/service.asmx`

Official registration basis:

- ARCA requires authorization requests per point of sale, with each point specific to its issuing
  modality and numbering correlated independently:
  `https://arca.gob.ar/fe/emision-autorizacion/solicitud-autorizacion.asp`.
- RG 5824/2026 requires local/establishment domiciles linked to points of emission to remain
  updated in Sistema Registral and points to identify their issuing system:
  `https://biblioteca.arca.gob.ar/search/query/norma.aspx?p=t%3ARAG%7Cn%3A5824%7Co%3A9%7Ca%3A2026%7Cf%3A12%2F02%2F2026`.
- ARCA's point-of-sale workflow associates the point with a domicile previously registered in
  Sistema Registral:
  `https://arca.gob.ar/facturacion/monotributo/factura-electronica.asp`.

## Goals / Non-Goals

- Goals:
  - Reusable, framework-independent TypeScript client.
  - Testable without real credentials or network calls.
  - Safe homologation/production separation.
  - Correct authentication, numbering, authorization and reconciliation primitives.
  - Structured results without leaking secrets or raw personal data.
- Non-Goals:
  - Automatic Portal IVA / IVA Simple submission.
  - CAEA contingency in the first delivery.
  - WSMTXCA item-detail invoicing.
  - Enabling Maitre production issuance before homologation evidence and fiscal review.

## Decisions

### Standalone package

`packages/arca-client` SHALL only expose ARCA concepts and generic injected ports. It SHALL NOT
import `@maitre/fiscal`, Fastify, Supabase or application configuration. Maitre mapping belongs in
the fiscal adapter layer.

### Explicit environment

Clients SHALL receive an environment and resolved endpoint set. Homologation is the safe default
for local configuration. Production construction SHALL require an explicit production selection;
the Maitre composition root SHALL fail closed if credentials or driver configuration are invalid.

### Injected infrastructure

HTTP transport, clock, ticket cache, credential source and CMS signer SHALL be interfaces.
Production-ready defaults may be provided, but tests will use deterministic fakes. This keeps the
protocol client portable across serverless functions, containers and other applications.

### XML and CMS

XML parsing SHALL use a maintained parser configured to disable unsafe entity expansion. CMS
signing SHALL be isolated behind `CmsSigner`, allowing a pure-JavaScript implementation or a
platform/HSM implementation without changing WSAA or WSFEv1 clients.

### Ticket handling

Tickets SHALL be cached by environment + represented CUIT + service and renewed before expiry
with clock-skew margin. Token, Sign, private keys and certificate bodies SHALL never appear in
errors or logs.

### Fiscal sequence

Maitre SHALL not derive the next production number solely from its local database. Before a new
authorization it SHALL obtain the official last number and serialize the logical sequence. An
ambiguous network result SHALL be reconciled with voucher consultation before any new number is
attempted.

### First integration seam

The reusable client will expose the real WSFEv1 request shape. The Maitre domain will gain the
missing fiscal snapshot fields before the adapter can issue. This avoids manufacturing invalid
defaults inside the adapter.

### Legal subscriber and fiscal issuer

`Tenant` remains the operational isolation boundary and `Subscription` remains the commercial
contract. A subscription SHALL reference one `subscriberFiscalEntityId` belonging to the same
tenant. That fiscal entity is the legal subscriber billed for Maitre and carries non-secret
identity data such as normalized CUIT, legal name, tax condition and registered addresses.

This reference does not imply that the subscriber is the only invoice issuer. A tenant may have
multiple fiscal entities and each branch continues to select the fiscal entity that issues its
restaurant vouchers. Changing the subscription subscriber is a sensitive audited operation and
does not rewrite historical invoices or prior subscription billing documents.

The current `FiscalEntity.name` is ambiguous. The persisted/public contract SHALL identify it as
`legalName`; an optional operational/display alias can be separate. CUIT and legal name are
regulated business identity data, not credentials. They remain tenant-protected and permissioned,
but are not stored in a secret manager.

### Public fiscal configuration versus secrets

Non-secret fiscal configuration belongs in relational tenant tables:

- CUIT and legal name;
- tax condition, registered activity and fiscal/legal addresses;
- represented CUIT and WSAA service identifier;
- certificate subject, issuer, serial, fingerprint and validity;
- branch, ARCA domicile and official point-of-sale code;
- issuing system, allowed voucher types and registration/verification state.

Secret material belongs only behind secret references:

- private key;
- access-ticket Token and Sign;
- any secret-manager payload containing certificate/private-key bundles;
- encrypted distributed ticket-cache values.

The public X.509 certificate is not cryptographically secret, but Maitre SHALL treat its full body
as operational credential material and store only metadata plus a secret reference in ordinary
tables. Neither certificate body nor private key is returned by general fiscal APIs.

### Branch, ARCA domicile and point-of-sale cardinality

ARCA requires points of sale/emission to be associated with a declared domicile and the issuing
system. Maitre SHALL model:

```text
FiscalEntity 1 ── * Branch 1 ── * FiscalPointOfSale
                         └──── 1 registered ARCA domicile per point of sale
```

A branch that emits vouchers in production SHALL have a domicile previously declared as a local
or establishment in Sistema Registral and at least one active production point of sale. One branch
may have multiple points of sale, for example a WSFE point and a separate controller-fiscal point.
One point of sale cannot belong to multiple branches. A WSFE point is distinct from points used by
controller fiscal, Comprobantes en Línea or another issuing regime.

Registration is performed through ARCA's “Administración de Puntos de Venta y Domicilios” /
Sistema Registral. WSFEv1 authorizes and queries vouchers; it is not treated as an API for creating
branches, domiciles or points of sale. Maitre stores operator-declared registration plus later
verification evidence and blocks production issuance while it is unverified.

Homologation points remain isolated from production registrations. Successful testing with an
arbitrary homologation number is not evidence that a production point of sale exists.

## Risks / Trade-offs

- ARCA may update WSDL validations without changing all documentation. Parameter methods and
  versioned fixtures reduce hardcoded assumptions.
- Homologation does not enforce every production business validation. A controlled production
  rollout and accountant review remain mandatory.
- Serverless concurrency is insufficient for fiscal numbering by itself. The adapter requires a
  durable sequence coordinator before production is enabled.
- ARCA does not expose a general WSFEv1 operation to create domiciles/points of sale. Incorrect
  operator-entered mappings could route numbering to the wrong branch. Production activation
  therefore requires explicit verification evidence and a four-eyes review.
- Adding complete recipient/tax data expands PII scope. Events remain minimized and logs redacted.

## Migration Plan

1. Introduce and test the standalone client without changing the active simulated driver.
2. Expand domain contracts and persistence with backward-compatible nullable draft fields.
3. Backfill or select the subscription subscriber fiscal entity per tenant.
4. Register branch domiciles and production points in ARCA, then record/verify their mappings.
5. Add the Maitre WSFEv1 adapter and homologation-only configuration.
6. Obtain testing certificates through WSASS and run the homologation matrix.
7. Add durable sequencing/reconciliation and an explicit production gate.
8. Enable one fiscal entity, branch and point of sale only after operational and fiscal approval.

Rollback consists of disabling the real driver. Already authorized vouchers remain immutable and
must never be replaced with simulated vouchers.

## Open Questions

- Which secret manager and CMS signer implementation will be used in the final hosting platform?
- Which fiscal profiles are in the first supported tenant matrix: registered VAT, monotributo,
  exempt, or all three?
- Is a durable container/worker available for reconciliation, or must it be added?
- Is the first subscription subscriber always one of the tenant's issuing fiscal entities, or must
  Maitre support a non-issuing legal subscriber in the initial migration?
