# Especificación — SPEC-046

## Endpoints

### GET /dashboard/setup-status
```
Response (200):
{
  data: {
    setup: {
      tenant: { configured: true },
      brands: { count: 1, required: 1 },
      branches: { count: 2, required: 1 },
      users: { count: 5, required: 1 },
      menus: { count: 1, required: 1 },
      products: { count: 50, required: 1 }
    },
    nextSteps: [
      "Agregar más sucursales",
      "Cargar menú"
    ]
  }
}
```
