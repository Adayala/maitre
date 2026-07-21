# Objetivo — SPEC-031

## Propósito

API para ver subscription, agregar servicios, cambiar plan.

## Resultado esperado

1. ✅ GET /subscriptions/:tenantId (ver actual)
2. ✅ POST /subscriptions/upgrade (cambiar plan)
3. ✅ POST /subscriptions/:id/services (agregar servicio)
4. ✅ PATCH /subscriptions/:id/services/:serviceId (modificar)
5. ✅ DELETE /subscriptions/:id/services/:serviceId (remover)
