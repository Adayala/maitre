---
schema: "agora/constitution/v1"
project: "maitre"
status: "draft"
---

# Project constitution

## Principles

- Humans and agents follow the same role contracts.
- Every external action is attributable to an actor and role.
- Work advances only when the active Method Pack permits it.
- Project language, runtime, LLM, and development process are configuration, not core assumptions.
- Decisions, handoffs, artifacts, and evidence remain reviewable in Git.
- Production-impacting actions require an explicit project policy.
- Environment-aware Tool Runs must bind a stable project environment separately from provider
  target inputs and credentials.
- Cross-host writer coordination may use a reviewed external lease CLI, but work truth remains in
  the filesystem and Git.
- Recursive delegation must remain acyclic and within the configured maximum depth.
- Repository commits follow every active standard in `.agora/STANDARDS.md`, including Conventional
  Commits 1.0.0.

## Local amendments

- Maitre is multi-tenant, white-label, and configuration-driven. Every change must select and
  preserve the working tenant explicitly and isolate data, authorization, caches, events, and side
  effects across tenants.
- Identity, navigation, modules, permissions, copy, styling, and behavior must resolve from tenant
  or brand configuration. Global hard-coded product defaults that prevent customization are not
  acceptable.
- New behavior may enter implementation only from an approved Maitre specification. The owning
  specification, decisions, contracts, and acceptance criteria must remain current throughout the
  work lifecycle.
- New or modified code requires observable unit-test coverage at 100% for statements, branches,
  functions, and lines. Coverage exclusions, lowered thresholds, deleted assertions, and trivial
  percentage-only tests are prohibited.
- Visual changes require complete affected-application Playwright coverage for the main journey,
  loading, empty, success, validation and error states, permissions, persistence, responsive
  behavior, accessibility, and real API integration when applicable.
- Completion requires successful format, lint, typecheck, dependency, unit coverage, security,
  specification, and affected Playwright gates. A flaky test, coverage regression, or missing
  visual scenario keeps work incomplete.
- Before implementation, governed work must identify the units, branches, errors, affected apps,
  Playwright journeys, deterministic fixtures, and tenant-isolation cases that require tests.
