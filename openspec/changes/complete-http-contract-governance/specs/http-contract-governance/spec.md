## ADDED Requirements

### Requirement: Versioned public OpenAPI contract

The system SHALL generate a deterministic OpenAPI 3.1 artifact from the same Fastify composition
used at runtime. Every public `/v1` operation MUST declare its request, successful responses,
expected problem responses, authentication, tenant/branch headers and owning functional spec.

#### Scenario: Contract generation is reproducible

- **WHEN** the contract generator runs twice against the same source revision
- **THEN** both generated artifacts are byte-for-byte equivalent
- **AND** the committed artifact contains every public `/v1` operation

#### Scenario: Undocumented public route

- **WHEN** a public `/v1` route is registered without its required contract metadata
- **THEN** contract validation fails
- **AND** the route cannot pass the required CI gate

### Requirement: Breaking HTTP changes are gated

CI MUST compare the candidate OpenAPI artifact with the merge-base artifact and fail for an
unapproved breaking change. Removing or renaming an operation or field, narrowing accepted input,
changing a field type, adding a required input, or changing a successful status is breaking.

#### Scenario: Compatible addition

- **WHEN** an optional response field or a new operation is added
- **THEN** the compatibility gate reports no breaking change

#### Scenario: Breaking response change

- **WHEN** a required response field is removed or its type changes
- **THEN** the compatibility gate fails with the affected operation and schema path

### Requirement: RFC 9457 problem responses

Every JSON HTTP error response MUST use `application/problem+json` and include an absolute stable
`type` URI, stable `title`, HTTP `status`, safe `detail`, request `instance`, machine-readable
`code`, and `correlationId`. Validation problems MUST include sanitized field-level errors.

#### Scenario: Validation failure

- **WHEN** an authenticated request contains invalid input
- **THEN** the API returns the specified 4xx status with `application/problem+json`
- **AND** the body identifies the request instance and invalid field paths without exposing
  internal schemas or stack traces

#### Scenario: Unexpected server failure

- **WHEN** an unclassified exception reaches the HTTP boundary
- **THEN** the API logs the failure with its correlation ID
- **AND** returns a generic internal-error problem without secret, SQL or stack information

### Requirement: Explicit CORS allowlist

The API MUST make CORS decisions from a normalized allowlist for the active environment and MUST
NOT reflect arbitrary request origins. Shared and production environments MUST fail startup when
the allowlist is absent or invalid.

#### Scenario: Allowed browser origin

- **WHEN** a preflight request uses an origin present in the environment allowlist
- **THEN** the API returns CORS headers for that exact origin and the supported method and headers

#### Scenario: Unknown browser origin

- **WHEN** a preflight request uses an origin absent from the environment allowlist
- **THEN** the API does not grant cross-origin access

#### Scenario: Missing production configuration

- **WHEN** the API starts in a shared or production environment without a valid origin allowlist
- **THEN** startup fails closed with an actionable configuration error
