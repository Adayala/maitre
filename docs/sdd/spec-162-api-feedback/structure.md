# Estructura — SPEC-162

```text
/feedback-submissions
└── POST public submit

/feedback
├── GET list
└── /{feedbackId}
    ├── GET detail
    ├── :triage
    ├── :assign
    ├── :resolve
    ├── :reopen
    └── :redact
```
