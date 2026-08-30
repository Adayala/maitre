---
schema: "agora/tool-run/v1"
id: "commit-gh-115"
tool: "repository"
operation: "commit"
actor: "project:fixes-agent"
swarm: "fixes-cycle-2"
work: "gh-115"
environment: null
capability: "repository.write"
risk: "write"
inputs: {"message":"fix(reservations): preserve staff-selected guest"}
command: ["git","commit","-m","fix(reservations): preserve staff-selected guest"]
runtime-available: true
status: "completed"
result-kind: "repository-change"
timeout-seconds: 300
max-output-bytes: 1048576
authentication-reference: "local-git-configuration"
created-at: "2026-08-30T11:22:29.332649Z"
exit-code: 0
authentication-verified: false
authentication-fingerprint: null
authentication-public-key: null
authorization-sha256: null
authorization-signature: null
---

# Tool run commit-gh-115

This record contains invocation metadata, not credentials. Authentication is resolved by the external executable and its environment.
