# Reglas — API

**Spec:** SPEC-009

## Autorización

Todo endpoint verifica:
1. User autenticado
2. User dentro del tenant (`X-Tenant-Id`)
3. User con permiso suficiente
4. User con alcance por sucursal cuando aplique

## Validación

- input validado antes de DB
- CUIT se normaliza a 11 dígitos y permanece único por tenant
- `taxCondition` usa el catálogo fiscal autoritativo del dominio
- `legalAddress`, `fiscalAddress` y `activityCode` son opcionales en I0
- errores devueltos como Problem Details con motivo auditable
- `Idempotency-Key` aplica a `POST` create; `PATCH` se protege con `If-Match`

## Aislamiento

Toda query se filtra por `tenant_id`.

## Exposición de datos

- certificados, claves, referencias cifradas y secretos no aparecen en responses
- la lectura puede redactar campos legales si el permiso fiscal no lo habilita
