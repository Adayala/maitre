# Especificación — SPEC-003

## Definición

Entidad fiscal es la persona o empresa que emite comprobantes. Contiene CUIT, condición tributaria (RI, Monotributista, Exento), certificados X.509 para ARCA.

Un tenant puede tener múltiples entidades fiscales (ej: empresa A y empresa B que operan en el mismo tenant).

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "cuit": "string (11 dígitos, formato XX-XXXXXXXX-X)",
  "name": "string (razón social)",
  "status": "enum: ACTIVE | INACTIVE | ARCHIVED",
  "tax_condition": "enum: RI | MONOTRIBUTISTA | EXENTO",
  "certificate": {
    "serial": "string",
    "subject": "string",
    "issuer": "string",
    "valid_from": "ISO8601",
    "valid_to": "ISO8601",
    "thumbprint": "string"
  },
  "certificate_key": "string (encrypted private key)",
  "arca_credentials": {
    "csr": "string (certificate signing request)",
    "authorized_at": "ISO8601 | null"
  },
  "createdAt": "ISO8601",
  "createdBy": "uuid",
  "updatedAt": "ISO8601",
  "updatedBy": "uuid"
}
```

## Validaciones

- `cuit` — 11 dígitos, formato correcto, checksum válido
- `tax_condition` — Debe coincidir con condición en AFIP
- `certificate` — Válido X.509, fecha vigente
- `certificate_key` — Cifrado con KMS (no en plaintext)
- `name` — Razón social (3-200 chars)

## Invariantes

### 1. CUIT único por tenant
No pueden existir 2 entidades fiscales con mismo CUIT en el mismo tenant.

### 2. Certificado vigente para emitir
Solo entidad fiscal con certificado válido (valid_to > now) puede emitir comprobantes.

### 3. Un certificado activo por entidad
Una entidad fiscal puede tener solo 1 certificado activo.

### 4. Renuevas no solapan
Al renovar certificado, el viejo + el nuevo no pueden coexistir (es una transición).

## Ejemplos

```json
{
  "id": "fiscal_001",
  "tenantId": "tenant_123",
  "cuit": "30-71234567-8",
  "name": "La Parrilla S.A.",
  "status": "ACTIVE",
  "tax_condition": "RI",
  "certificate": {
    "serial": "0x1234567890ABCDEF",
    "valid_from": "2026-01-01T00:00:00Z",
    "valid_to": "2028-01-01T00:00:00Z",
    "thumbprint": "SHA256:..."
  }
}
```
