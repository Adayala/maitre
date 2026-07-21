# Especificación — SPEC-032

## Endpoints

### GET /entitlements/:tenantId
```
Response (200):
{
  data: {
    entitlements: [
      { resource: "branches", hardLimit: 3, softLimit: 2 },
      { resource: "users", hardLimit: 50, softLimit: 40 }
    ],
    quotas: [
      { resource: "branches", used: 1 },
      { resource: "users", used: 8 }
    ]
  }
}
```
