# Estructura — SPEC-174

```text
Webhook Model
├── OutboundWebhookSubscription
│   ├── target / event allowlist / filters
│   ├── signing secret ref
│   └── retry policy / deliveries / DLQ
└── ProviderWebhookEndpoint
    ├── route identity / schema limits
    ├── verification secret ref
    └── receipts / replay identity
```
