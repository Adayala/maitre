# Estructura — SPEC-175

```text
Sync State
├── SyncCheckpoint
│   ├── current cursor / version
│   └── lease owner / expiry
├── SyncRun
│   ├── original cursor
│   ├── candidate cursor
│   └── mode / policy / counts / outcome
└── SyncLog
    └── append-only redacted evidence
```
