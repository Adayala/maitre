# Estructura — SPEC-177

```text
/oauth/start
└── POST start auth flow

/oauth/callback
└── GET|POST callback consume state

/oauth/{integrationId}
├── :reauthorize
└── :revoke
```
