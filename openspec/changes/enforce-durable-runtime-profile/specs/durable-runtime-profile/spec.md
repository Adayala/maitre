## ADDED Requirements

### Requirement: Shared runtimes use durable adapters

The API MUST resolve persistence and authentication before constructing application state.
Memory persistence and fixture authentication MUST be limited to local, test and controlled E2E
profiles. Every other environment MUST explicitly select durable persistence and real
authentication and MUST fail startup when required configuration is absent.

#### Scenario: Production configuration is incomplete

- **WHEN** a production or provider production environment omits a durable driver or credential
- **THEN** API composition fails before repositories are constructed or traffic is served
- **AND** it does not fall back to memory or fixture identities

#### Scenario: Hermetic unit test

- **WHEN** a test profile explicitly or implicitly selects memory and fixture adapters
- **THEN** deterministic local composition remains available without network access
- **AND** that profile is classified as non-release

### Requirement: Deployment preflight is sanitized

The production deployment workflow MUST validate the provider-resolved API environment before
publishing. Validation MUST NOT evaluate environment-file shell expressions or print secret
values.

#### Scenario: Durable production profile

- **WHEN** the provider environment declares production, Supabase persistence/auth and complete
  server credentials
- **THEN** preflight emits only sanitized capability evidence
- **AND** deployment may continue

#### Scenario: Ephemeral production profile

- **WHEN** the provider environment selects memory, fixture auth or lacks a required credential
- **THEN** preflight fails before deployment
- **AND** no secret value appears in output
