# Reglas — API

**Spec:** SPEC-008

## Autorización

Todo endpoint verifica:
1. User autenticado
2. User dentro del tenant (`X-Tenant-Id`)
3. User con permiso suficiente
4. User con alcance por sucursal cuando aplique

## Validación

- input validado antes de DB
- errores devueltos con campo + motivo
- `Idempotency-Key` para `POST`/`PATCH` cuando corresponda

## Aislamiento

Toda query se filtra por `tenant_id`.
