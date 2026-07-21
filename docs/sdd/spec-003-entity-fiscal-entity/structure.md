# Structure — SPEC-003

## Database schema

```sql
CREATE TABLE fiscal_entities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  cuit VARCHAR(11) NOT NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  tax_condition VARCHAR(20),
  certificate_id UUID,
  certificate_key_encrypted TEXT,
  arca_authorized_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  UNIQUE(tenant_id, cuit),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id)
);

CREATE TABLE fiscal_certificates (
  id UUID PRIMARY KEY,
  fiscal_entity_id UUID NOT NULL,
  serial VARCHAR(50),
  subject TEXT,
  issuer TEXT,
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  thumbprint VARCHAR(128),
  raw_cert TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY(fiscal_entity_id) REFERENCES fiscal_entities(id)
);
```

## Notes

- `certificate_key_encrypted`: Almacenar en KMS, no en BD
- `valid_to`: Índice para queries de certificados vigentes
