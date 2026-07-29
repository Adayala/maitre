## ADDED Requirements

### Requirement: Reusable ARCA protocol client

The system SHALL provide an ARCA protocol client that does not depend on Maitre domain, API,
persistence or framework packages and that accepts infrastructure through explicit ports.

#### Scenario: Client used by another application
- **WHEN** another Node.js application supplies credentials, CMS signer, HTTP transport and cache
- **THEN** it can authenticate and call WSFEv1 without importing any Maitre-specific module

### Requirement: Explicit ARCA environments

The client SHALL provide the official homologation and production WSAA/WSFEv1 endpoints and SHALL
keep credentials, tickets and caches isolated by environment.

#### Scenario: Homologation client
- **WHEN** a client is constructed for homologation
- **THEN** all WSAA and WSFEv1 calls target the official homologation endpoints

#### Scenario: Production not explicitly configured
- **WHEN** Maitre requests the real driver without valid explicit production configuration
- **THEN** startup fails closed and does not fall back to simulated authorization

### Requirement: WSAA authentication

The client SHALL create a time-bounded Login Ticket Request for service `wsfe`, sign it as CMS,
call WSAA and return/cache Token and Sign without exposing secret material.

#### Scenario: Valid cached ticket
- **WHEN** a non-expiring ticket exists for the same environment, CUIT and service
- **THEN** the client reuses it without calling WSAA

#### Scenario: Ticket near expiry
- **WHEN** a cached ticket is within the configured renewal margin
- **THEN** the client obtains and stores a replacement before calling WSFEv1

### Requirement: WSFEv1 core operations

The client SHALL support service health, official last-authorized number, CAE authorization,
voucher consultation and required parameter-table operations with typed requests and normalized
responses.

#### Scenario: Voucher authorized
- **WHEN** WSFEv1 approves a valid CAE request
- **THEN** the result contains the assigned voucher number, CAE, expiry, observations and provider
  processing metadata

#### Scenario: Voucher rejected
- **WHEN** WSFEv1 rejects a request
- **THEN** the result contains structured codes and sanitized messages and is not retried as a
  transport failure

### Requirement: Ambiguous outcome reconciliation

The Maitre integration SHALL preserve an authorization attempt when transport fails after dispatch
and SHALL consult ARCA for the same fiscal identity before attempting another number.

#### Scenario: Timeout after dispatch
- **WHEN** a CAE request times out and it is unknown whether ARCA processed it
- **THEN** the invoice enters pending reconciliation and no new voucher number is attempted

### Requirement: Official fiscal numbering

The Maitre integration SHALL coordinate each CUIT, environment, point-of-sale and voucher-type
sequence and SHALL compare the local intent with `FECompUltimoAutorizado`.

#### Scenario: Local sequence is stale
- **WHEN** ARCA reports a later last-authorized number than Maitre
- **THEN** Maitre uses the next official number and records the reconciliation discrepancy

### Requirement: Secret and PII protection

Private keys, certificate bodies, Token, Sign and complete personal SOAP payloads MUST NOT be sent
to browsers or emitted in ordinary logs and errors.

#### Scenario: SOAP authentication failure
- **WHEN** ARCA returns an authentication or SOAP fault
- **THEN** the application exposes a normalized error without credentials, ticket values or raw
  signed payloads

### Requirement: Homologation before production

Real production issuance SHALL remain disabled until credentialed homologation evidence, fiscal
review, sequence coordination and an operational runbook exist.

#### Scenario: First implementation completed
- **WHEN** the reusable client and homologation adapter pass automated tests
- **THEN** production remains disabled until the separate readiness conditions are recorded

### Requirement: Subscription legal owner

Every subscription SHALL reference exactly one active fiscal entity of the same tenant as its
legal subscriber. The referenced entity SHALL expose normalized CUIT, legal name and fiscal
condition as permissioned relational data, not secret-manager values.

#### Scenario: Subscription created
- **WHEN** a subscription is created for a tenant
- **THEN** an active same-tenant fiscal entity is selected as `subscriberFiscalEntityId`

#### Scenario: Tenant has multiple fiscal entities
- **WHEN** a tenant operates with multiple issuing fiscal entities
- **THEN** exactly one is the current legal subscriber while branches may continue issuing through
  any correctly assigned tenant fiscal entity

#### Scenario: Subscriber changes
- **WHEN** an authorized owner changes the subscription's legal subscriber
- **THEN** the change requires step-up authorization, reason and audit history and does not mutate
  historical fiscal or subscription documents

### Requirement: Fiscal identity data classification

The system SHALL store CUIT, legal name, tax condition, registered activities, addresses,
represented CUIT, certificate metadata and point-of-sale registration as permissioned relational
configuration. It MUST store private keys and WSAA Token/Sign only behind protected secret/cache
boundaries.

#### Scenario: Owner views subscription billing identity
- **WHEN** an authorized tenant owner views subscription details
- **THEN** the API can return the subscriber's CUIT, legal name and fiscal condition without
  reading the ARCA private key or access ticket

#### Scenario: General fiscal API response
- **WHEN** a fiscal entity or point of sale is returned by an ordinary API
- **THEN** no private key, Token, Sign, full credential bundle or secret-manager payload is present

### Requirement: Legal name is distinct from display alias

A fiscal entity SHALL have an authoritative `legalName` used on fiscal/subscription documents and
MAY have a separate operational display alias. An alias MUST NOT replace the legal name in an
authorized voucher.

#### Scenario: Restaurant uses a trade name
- **WHEN** a branch displays a restaurant brand different from its company's legal name
- **THEN** customer-facing branding may use the alias/brand while the fiscal document uses the
  fiscal entity's legal name

### Requirement: Branch domicile registration

A branch that issues production vouchers SHALL reference a fiscal entity of the same tenant and
SHALL have its issuing domicile declared in ARCA Sistema Registral as a local or establishment.

#### Scenario: New physical branch
- **WHEN** a new branch is prepared for production invoicing
- **THEN** Maitre records the declared ARCA domicile and blocks production issuance until its
  registration has been verified

#### Scenario: Branch does not issue vouchers
- **WHEN** a branch is operational but all vouchers are issued elsewhere under a documented model
- **THEN** it is not forced to own a point of sale, but it cannot directly request production
  authorization

### Requirement: Branch point-of-sale mapping

Every production fiscal point of sale SHALL belong to exactly one branch, fiscal entity,
environment, registered domicile and issuing system. A branch MAY own multiple points of sale, but
a point of sale MUST NOT span branches or issuing systems.

#### Scenario: WSFE point for a branch
- **WHEN** a branch issues through Maitre WSFEv1
- **THEN** its point is registered in ARCA for the applicable Web Services modality and is distinct
  from controller-fiscal and Comprobantes-en-Línea points

#### Scenario: Branch has controller and WSFE
- **WHEN** the same branch uses a controller fiscal and WSFEv1 as separate authorized modalities
- **THEN** Maitre stores two distinct point-of-sale records and independent numbering sequences

#### Scenario: Point belongs to another branch
- **WHEN** an invoice attempts to use a point mapped to a different branch
- **THEN** authorization is rejected before contacting ARCA

### Requirement: ARCA registration evidence

The system SHALL track point-of-sale/domicile registration lifecycle as
`DECLARED | VERIFIED | REJECTED | INACTIVE`, including who verified it, when, and the evidence
reference. Only `VERIFIED` production mappings may issue.

#### Scenario: Operator enters an official code
- **WHEN** an operator records a point-of-sale number without verification evidence
- **THEN** its state is `DECLARED` and production authorization remains blocked

#### Scenario: Registration verified
- **WHEN** an authorized reviewer verifies the branch, domicile, fiscal entity and issuing-system
  mapping against ARCA
- **THEN** the mapping becomes `VERIFIED` and can pass that production readiness check

### Requirement: Registration is not performed through WSFEv1

Maitre SHALL treat ARCA point-of-sale and domicile registration as an external administrative
prerequisite unless an official purpose-built API is documented and implemented. It MUST NOT
claim that a successful WSFEv1 call created a branch, domicile or point of sale.

#### Scenario: Homologation accepts a point number
- **WHEN** a homologation request succeeds using a test point-of-sale number
- **THEN** Maitre records test evidence only and does not mark the corresponding production point
  as registered or verified
