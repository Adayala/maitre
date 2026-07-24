# Estructura — SPEC-196

```text
/alert-rules
├── POST create
└── /{ruleId}
    ├── PATCH edit
    ├── :preview
    └── :publish

/alerts
└── /{alertId}
    ├── :acknowledge
    ├── :resolve
    ├── :dismiss
    ├── :snooze
    └── :reopen
```
