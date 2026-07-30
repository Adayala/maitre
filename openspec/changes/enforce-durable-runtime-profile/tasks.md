## 1. Runtime composition

- [x] 1.1 Resolve persistence and authentication through one validated runtime profile.
- [x] 1.2 Reject unknown, incomplete and ephemeral shared-environment profiles.
- [x] 1.3 Preserve dependency-free memory/fixture composition for local and hermetic tests.

## 2. Release gate

- [x] 2.1 Parse provider-downloaded environment files without shell evaluation or secret output.
- [x] 2.2 Run the durable-profile preflight before production API deployment.
- [x] 2.3 Add deterministic policy tests to the required quality workflow.

## 3. Documentation and verification

- [x] 3.1 Document required variables, credential boundary and rollout impact.
- [ ] 3.2 Provision ephemeral PostgreSQL/Supabase and apply migrations from zero in release E2E.
- [ ] 3.3 Verify tenant RLS, restart durability and teardown evidence.
- [x] 3.4 Run typecheck, tests, config validation and strict OpenSpec validation.
