# Estructura — SPEC-148

```text
/invoice-templates
├── POST create draft
├── GET list
└── /{templateId}
    ├── PATCH edit draft
    ├── :preview
    ├── :publish
    └── :deactivate
```
