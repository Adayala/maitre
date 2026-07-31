## 1. Audit contract and persistence

- [x] 1.1 Extend AuditLog with action code, branch, outcome, reason code and request identifiers.
- [x] 1.2 Add migration, indexes and persistence mapping for the additive fields.
- [x] 1.3 Implement allowlist evidence projectors, redaction rules and serialized size limits.
- [ ] 1.4 Add an audit-aware unit-of-work port for atomic state, outbox and evidence writes.

## 2. Domain coverage

- [ ] 2.1 Instrument Floor sensitive commands and test success, denial and rollback behavior.
- [ ] 2.2 Instrument Ordering sensitive commands and test success, denial and idempotent replay.
- [ ] 2.3 Instrument Kitchen sensitive commands and test transitions, rerouting and alert actions.
- [ ] 2.4 Instrument Cash and Payment sensitive commands with monetary evidence and reason policies.
- [x] 2.5 Remove deferred-instrumentation notes once the coverage matrix is complete.

The mandatory HTTP policy matrix now covers every state-changing Floor,
Ordering, Kitchen and Cash route and the release journey proves representative
success evidence in all four domains. Tasks 2.1–2.4 remain open for their
transactional rollback/idempotency and exhaustive transition assertions, which
depend on task 1.4 rather than on missing route instrumentation.

## 3. Query, governance and operations

- [x] 3.1 Extend audit queries with branch, action code, outcome, resource and correlation filters.
- [x] 3.2 Add a contract test that rejects uncovered sensitive mutations.
- [ ] 3.3 Add audit append failure/rate/size metrics and an operational alert.
- [x] 3.4 Document redaction, incident lookup, coverage boundary and rollback procedures.
- [ ] 3.5 Run migrations, typecheck, domain/API tests and strict OpenSpec validation.
